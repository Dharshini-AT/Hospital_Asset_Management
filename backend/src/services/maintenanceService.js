const mongoose = require("mongoose");
const MaintenanceRequest = require("../models/MaintenanceRequest");
const Asset = require("../models/Asset");
const User = require("../models/User");
const historyService = require("./historyService");
const notificationService = require("./notificationService");
const { generateSequenceId } = require("../utils/generateId");
const {
  MAINTENANCE_STATUS,
  ASSET_STATUS,
  AVAILABILITY_STATUS,
  NOTIFICATION_TYPE,
  ROLES
} = require("../utils/constants");
const { calculateNextMaintenanceDate } = require("../utils/dateUtils");

const ACTIVE_STATUSES = [
  MAINTENANCE_STATUS.PENDING,
  MAINTENANCE_STATUS.ASSIGNED,
  MAINTENANCE_STATUS.IN_PROGRESS
];

class MaintenanceService {
  async resolveAsset(identifier, session = null) {
    const value = String(identifier || "");
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(value);
    const filter = isObjectId ? { _id: value } : { assetId: value.toUpperCase() };
    const query = Asset.findOne(filter);
    if (session) query.session(session);
    return query;
  }

  async resolveRequest(identifier, session = null) {
    const value = String(identifier || "");
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(value);
    const filter = isObjectId ? { _id: value } : { requestId: value.toUpperCase() };
    const query = MaintenanceRequest.findOne(filter);
    if (session) query.session(session);
    return query;
  }

  async getActiveRequestForAsset(assetObjectId, session = null) {
    const query = MaintenanceRequest.findOne({
      assetId: assetObjectId,
      status: { $in: ACTIVE_STATUSES }
    }).populate("assignedTechnician", "userId name email phone");
    if (session) query.session(session);
    return query;
  }

  async runWithOptionalTransaction(operation) {
    let session = null;
    try {
      session = await mongoose.startSession();
      let result;
      await session.withTransaction(async () => {
        result = await operation(session);
      });
      return result;
    } catch (error) {
      if (
        error.message?.includes("Transaction numbers are only allowed") ||
        error.message?.includes("replica set")
      ) {
        return await operation(null);
      }
      throw error;
    } finally {
      if (session) {
        await session.endSession().catch(() => {});
      }
    }
  }

  async createRequest({
    assetIdentifier,
    reportedByUserId,
    issueType,
    issueDescription,
    priority
  }) {
    const createdRequest = await this.runWithOptionalTransaction(async (session) => {
      const asset = await this.resolveAsset(assetIdentifier, session);

      if (!asset) {
        const error = new Error("Asset not found.");
        error.statusCode = 404;
        throw error;
      }

      if (asset.currentStatus === ASSET_STATUS.RETIRED) {
        const error = new Error("A retired asset cannot receive a maintenance request.");
        error.statusCode = 400;
        throw error;
      }

      const existing = await this.getActiveRequestForAsset(asset._id, session);

      if (existing) {
        const error = new Error(
          "An active maintenance request already exists for this asset."
        );
        error.statusCode = 409;
        error.existingRequest = {
          requestId: existing.requestId,
          status: existing.status,
          reportedAt: existing.reportedAt
        };
        throw error;
      }

      const requestId = await generateSequenceId(
        MaintenanceRequest,
        "requestId",
        "MR",
        4
      );

      const [newReq] = await MaintenanceRequest.create(
        [{
          requestId,
          assetId: asset._id,
          reportedBy: reportedByUserId,
          issueType,
          issueDescription,
          priority,
          status: MAINTENANCE_STATUS.PENDING,
          reportedAt: new Date()
        }],
        session ? { session } : undefined
      );

      asset.currentStatus = ASSET_STATUS.UNDER_MAINTENANCE;
      if (session) {
        await asset.save({ session });
      } else {
        await asset.save();
      }

      return newReq;
    });

    const populated = await this.getRequestById(createdRequest._id);
    await notificationService.notifyAdmins({
      type: NOTIFICATION_TYPE.REQUEST_CREATED,
      title: "New Maintenance Request",
      message: `Maintenance request ${populated.requestId} requires review.`,
      relatedRequestId: populated._id,
      relatedAssetId: populated.assetId?._id || populated.assetId
    });

    return populated;
  }

  async assignTechnician({
    requestIdentifier,
    technicianIdentifier,
    adminUserId
  }) {
    const request = await this.resolveRequest(requestIdentifier);

    if (!request) {
      const error = new Error("Maintenance request not found.");
      error.statusCode = 404;
      throw error;
    }

    if (request.status !== MAINTENANCE_STATUS.PENDING) {
      const error = new Error(
        `Only PENDING requests can be assigned. Current status is ${request.status}.`
      );
      error.statusCode = 400;
      throw error;
    }

    const value = String(technicianIdentifier || "");
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(value);
    const techFilter = isObjectId
      ? { _id: value }
      : { userId: value.toUpperCase() };

    const technician = await User.findOne({
      ...techFilter,
      role: ROLES.TECHNICIAN,
      accountStatus: "ACTIVE"
    });

    if (!technician) {
      const error = new Error("Technician not found or inactive.");
      error.statusCode = 404;
      throw error;
    }

    if (technician.availabilityStatus !== AVAILABILITY_STATUS.AVAILABLE) {
      const error = new Error("Selected technician is not currently available.");
      error.statusCode = 409;
      throw error;
    }

    request.assignedTechnician = technician._id;
    request.assignedBy = adminUserId;
    request.assignedAt = new Date();
    request.status = MAINTENANCE_STATUS.ASSIGNED;
    await request.save();

    technician.availabilityStatus = AVAILABILITY_STATUS.BUSY;
    await technician.save();

    const asset = await Asset.findById(request.assetId);

    await notificationService.createNotification({
      recipientId: technician._id,
      type: NOTIFICATION_TYPE.REQUEST_ASSIGNED,
      title: "New Maintenance Assignment",
      message: `Request ${request.requestId} for ${asset?.assetName || "equipment"} has been assigned to you.`,
      relatedRequestId: request._id,
      relatedAssetId: request.assetId
    });

    await notificationService.createNotification({
      recipientId: request.reportedBy,
      type: NOTIFICATION_TYPE.REQUEST_ASSIGNED,
      title: "Technician Assigned",
      message: `Your maintenance request ${request.requestId} has been assigned to ${technician.name}.`,
      relatedRequestId: request._id,
      relatedAssetId: request.assetId
    });

    return this.getRequestById(request._id);
  }

  async startMaintenance({ requestIdentifier, userId }) {
    const request = await this.resolveRequest(requestIdentifier);

    if (!request) {
      const error = new Error("Maintenance request not found.");
      error.statusCode = 404;
      throw error;
    }

    if (
      !request.assignedTechnician ||
      request.assignedTechnician.toString() !== userId.toString()
    ) {
      const error = new Error(
        "Only the technician assigned to this request can start maintenance."
      );
      error.statusCode = 403;
      throw error;
    }

    if (request.status !== MAINTENANCE_STATUS.ASSIGNED) {
      const error = new Error(
        `Cannot start maintenance. Current status is ${request.status}.`
      );
      error.statusCode = 400;
      throw error;
    }

    request.status = MAINTENANCE_STATUS.IN_PROGRESS;
    request.startedAt = new Date();
    await request.save();

    const tech = await User.findById(request.assignedTechnician);

    await notificationService.createNotification({
      recipientId: request.reportedBy,
      type: NOTIFICATION_TYPE.MAINTENANCE_STARTED,
      title: "Maintenance Started",
      message: `Technician ${tech?.name || ""} has started work on request ${request.requestId}.`,
      relatedRequestId: request._id,
      relatedAssetId: request.assetId
    });

    return this.getRequestById(request._id);
  }

  async completeMaintenance({
    requestIdentifier,
    userId,
    diagnosis,
    workPerformed,
    partsReplaced = "None",
    downtime = 0,
    maintenanceCost = 0,
    conditionAfterMaintenance,
    result = "RESOLVED",
    remarks = ""
  }) {
    const resultData = await this.runWithOptionalTransaction(async (session) => {
      const request = await this.resolveRequest(requestIdentifier, session);

      if (!request) {
        const error = new Error("Maintenance request not found.");
        error.statusCode = 404;
        throw error;
      }

      if (
        !request.assignedTechnician ||
        request.assignedTechnician.toString() !== userId.toString()
      ) {
        const error = new Error(
          "Only the technician assigned to this request can complete maintenance."
        );
        error.statusCode = 403;
        throw error;
      }

      if (request.status !== MAINTENANCE_STATUS.IN_PROGRESS) {
        const error = new Error(
          `Cannot complete maintenance. Current status is ${request.status}.`
        );
        error.statusCode = 400;
        throw error;
      }

      const assetQuery = Asset.findById(request.assetId);
      if (session) assetQuery.session(session);
      const asset = await assetQuery;

      if (!asset) {
        const error = new Error("Associated asset not found.");
        error.statusCode = 404;
        throw error;
      }

      const previousStatus = asset.currentStatus;
      const completedAt = new Date();

      request.diagnosis = diagnosis;
      request.workPerformed = workPerformed;
      request.partsReplaced = partsReplaced;
      request.downtime = Number(downtime);
      request.maintenanceCost = Number(maintenanceCost);
      request.conditionAfterMaintenance = conditionAfterMaintenance;
      request.remarks = remarks;
      request.completedAt = completedAt;
      request.status = MAINTENANCE_STATUS.COMPLETED;

      let statusAfterMaintenance = ASSET_STATUS.AVAILABLE;
      if (
        conditionAfterMaintenance === "POOR" ||
        conditionAfterMaintenance === "CRITICAL"
      ) {
        statusAfterMaintenance = ASSET_STATUS.OUT_OF_SERVICE;
      }

      asset.currentStatus = statusAfterMaintenance;
      asset.currentCondition = conditionAfterMaintenance;
      asset.lastMaintenanceDate = completedAt;
      asset.nextMaintenanceDate = calculateNextMaintenanceDate(
        completedAt,
        asset.maintenanceFrequency
      );

      if (session) {
        await request.save({ session });
        await asset.save({ session });
      } else {
        await request.save();
        await asset.save();
      }

      const historyRecord =
        await historyService.recordMaintenanceCompletion(
          {
            assetId: asset._id,
            maintenanceRequestId: request._id,
            technicianId: request.assignedTechnician,
            previousStatus,
            issueDescription: request.issueDescription,
            diagnosis,
            maintenanceType: asset.maintenanceType,
            workPerformed,
            partsReplaced,
            downtime: request.downtime,
            maintenanceCost: request.maintenanceCost,
            statusAfterMaintenance,
            conditionAfterMaintenance,
            result,
            remarks
          },
          session
        );

      const otherActiveQuery = MaintenanceRequest.countDocuments({
        assignedTechnician: request.assignedTechnician,
        status: { $in: ACTIVE_STATUSES },
        _id: { $ne: request._id }
      });
      if (session) otherActiveQuery.session(session);
      const otherActiveJobs = await otherActiveQuery;

      if (otherActiveJobs === 0) {
        const updateParams = [
          request.assignedTechnician,
          { availabilityStatus: AVAILABILITY_STATUS.AVAILABLE }
        ];
        if (session) updateParams.push({ session });
        await User.findByIdAndUpdate(...updateParams);
      }

      return {
        requestId: request._id,
        historyId: historyRecord._id,
        assetId: asset._id,
        statusAfterMaintenance
      };
    });

    const completedRequest = await this.getRequestById(resultData.requestId);
    const historyRecord = await historyService.getHistoryById(resultData.historyId);

    await notificationService.createNotification({
      recipientId: completedRequest.reportedBy._id,
      type: NOTIFICATION_TYPE.MAINTENANCE_COMPLETED,
      title: "Maintenance Completed",
      message: `Maintenance request ${completedRequest.requestId} has been completed.`,
      relatedRequestId: completedRequest._id,
      relatedAssetId: completedRequest.assetId._id
    });

    await notificationService.notifyAdmins({
      type: NOTIFICATION_TYPE.MAINTENANCE_COMPLETED,
      title: "Maintenance Request Completed",
      message: `Request ${completedRequest.requestId} has been completed.`,
      relatedRequestId: completedRequest._id,
      relatedAssetId: completedRequest.assetId._id
    });

    return {
      request: completedRequest,
      historyRecord,
      asset: await Asset.findById(resultData.assetId)
    };
  }

  async getRequestById(identifier) {
    const value = String(identifier || "");
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(value);
    const filter = isObjectId
      ? { _id: value }
      : { requestId: value.toUpperCase() };

    return MaintenanceRequest.findOne(filter)
      .populate("assetId")
      .populate("reportedBy", "userId name email phone department designation")
      .populate("assignedBy", "userId name email department")
      .populate(
        "assignedTechnician",
        "userId name email phone specialization department availabilityStatus"
      );
  }

  async getRequests(query = {}, user) {
    const {
      search,
      status,
      priority,
      issueType,
      assetId,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = query;

    const conditions = [];

    if (user?.role === ROLES.STAFF) {
      conditions.push({ reportedBy: user._id });
    }

    if (user?.role === ROLES.TECHNICIAN) {
      conditions.push({ assignedTechnician: user._id });
    }

    if (status) conditions.push({ status });
    if (priority) conditions.push({ priority });
    if (issueType) conditions.push({ issueType });

    if (assetId) {
      const asset = await this.resolveAsset(assetId);
      if (!asset) {
        return { requests: [], total: 0, page: Number(page), pages: 0 };
      }
      conditions.push({ assetId: asset._id });
    }

    if (search) {
      const regex = new RegExp(String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      conditions.push({
        $or: [
          { requestId: regex },
          { issueType: regex },
          { issueDescription: regex }
        ]
      });
    }

    const filter = conditions.length ? { $and: conditions } : {};

    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 10));
    const allowedSortFields = [
      "createdAt",
      "reportedAt",
      "assignedAt",
      "completedAt",
      "priority",
      "status"
    ];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sort = { [safeSortBy]: sortOrder === "asc" ? 1 : -1 };
    const skip = (safePage - 1) * safeLimit;

    const [requests, total] = await Promise.all([
      MaintenanceRequest.find(filter)
        .populate(
          "assetId",
          "assetId assetName assetType location department currentStatus currentCondition"
        )
        .populate("reportedBy", "userId name email department phone")
        .populate(
          "assignedTechnician",
          "userId name email phone specialization availabilityStatus"
        )
        .populate("assignedBy", "userId name")
        .sort(sort)
        .skip(skip)
        .limit(safeLimit),
      MaintenanceRequest.countDocuments(filter)
    ]);

    return {
      requests,
      total,
      page: safePage,
      pages: Math.ceil(total / safeLimit)
    };
  }
}

module.exports = new MaintenanceService();
