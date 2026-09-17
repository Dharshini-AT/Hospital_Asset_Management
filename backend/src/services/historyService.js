const MaintenanceHistory = require("../models/MaintenanceHistory");
const { generateSequenceId } = require("../utils/generateId");

class HistoryService {
  async recordMaintenanceCompletion(data, session = null) {
    const historyId = await generateSequenceId(
      MaintenanceHistory,
      "historyId",
      "MH",
      4
    );

    const [record] = await MaintenanceHistory.create(
      [{
        historyId,
        assetId: data.assetId,
        maintenanceRequestId: data.maintenanceRequestId,
        technicianId: data.technicianId,
        maintenanceDate: data.maintenanceDate || new Date(),
        previousStatus: data.previousStatus,
        issueDescription: data.issueDescription,
        diagnosis: data.diagnosis,
        maintenanceType: data.maintenanceType,
        workPerformed: data.workPerformed,
        partsReplaced: data.partsReplaced || "None",
        downtime: Number(data.downtime) || 0,
        maintenanceCost: Number(data.maintenanceCost) || 0,
        statusAfterMaintenance: data.statusAfterMaintenance,
        conditionAfterMaintenance: data.conditionAfterMaintenance,
        result: data.result || "RESOLVED",
        remarks: data.remarks || ""
      }],
      session ? { session } : undefined
    );

    return record;
  }

  async getAssetHistory(assetId) {
    return MaintenanceHistory.find({ assetId })
      .populate("technicianId", "userId name email phone specialization")
      .populate(
        "maintenanceRequestId",
        "requestId issueType priority reportedAt completedAt"
      )
      .sort({ maintenanceDate: -1 });
  }

  async getAllHistories(query = {}) {
    const {
      assetId,
      technicianId,
      maintenanceType,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = query;

    const filter = {};
    if (assetId) filter.assetId = assetId;
    if (technicianId) filter.technicianId = technicianId;
    if (maintenanceType) filter.maintenanceType = maintenanceType;

    if (startDate || endDate) {
      filter.maintenanceDate = {};
      if (startDate) filter.maintenanceDate.$gte = new Date(startDate);
      if (endDate) filter.maintenanceDate.$lte = new Date(endDate);
    }

    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (safePage - 1) * safeLimit;

    const [records, total] = await Promise.all([
      MaintenanceHistory.find(filter)
        .populate("assetId", "assetId assetName assetType department location")
        .populate("technicianId", "userId name email specialization")
        .populate("maintenanceRequestId", "requestId issueType priority")
        .sort({ maintenanceDate: -1 })
        .skip(skip)
        .limit(safeLimit),
      MaintenanceHistory.countDocuments(filter)
    ]);

    return {
      records,
      total,
      page: safePage,
      pages: Math.ceil(total / safeLimit)
    };
  }

  async getHistoryById(identifier) {
    const value = String(identifier || "");
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(value);
    const filter = isObjectId
      ? { _id: value }
      : { historyId: value.toUpperCase() };

    return MaintenanceHistory.findOne(filter)
      .populate("assetId")
      .populate(
        "technicianId",
        "userId name email phone specialization department"
      )
      .populate({
        path: "maintenanceRequestId",
        populate: [
          { path: "reportedBy", select: "userId name department email phone" },
          { path: "assignedBy", select: "userId name department" }
        ]
      });
  }
}

module.exports = new HistoryService();
