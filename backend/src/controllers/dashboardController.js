const Asset = require("../models/Asset");
const MaintenanceRequest = require("../models/MaintenanceRequest");
const MaintenanceHistory = require("../models/MaintenanceHistory");
const User = require("../models/User");
const { ROLES, MAINTENANCE_STATUS, ASSET_STATUS } = require("../utils/constants");

const getAdminStats = async () => {
  const now = new Date();
  const in30Days = new Date(now);
  in30Days.setDate(in30Days.getDate() + 30);

  const [
    totalAssets,
    pendingRequests,
    assignedRequests,
    inProgressRequests,
    completedRequests,
    underMaintenance,
    overdueMaintenance,
    warrantyExpiring,
    availableTechnicians,
    summary
  ] = await Promise.all([
    Asset.countDocuments(),
    MaintenanceRequest.countDocuments({ status: MAINTENANCE_STATUS.PENDING }),
    MaintenanceRequest.countDocuments({ status: MAINTENANCE_STATUS.ASSIGNED }),
    MaintenanceRequest.countDocuments({ status: MAINTENANCE_STATUS.IN_PROGRESS }),
    MaintenanceRequest.countDocuments({ status: MAINTENANCE_STATUS.COMPLETED }),
    Asset.countDocuments({ currentStatus: ASSET_STATUS.UNDER_MAINTENANCE }),
    Asset.countDocuments({
      nextMaintenanceDate: { $lt: now },
      currentStatus: { $nin: [ASSET_STATUS.RETIRED] }
    }),
    Asset.countDocuments({
      warrantyEndDate: { $gte: now, $lte: in30Days }
    }),
    User.countDocuments({
      role: ROLES.TECHNICIAN,
      accountStatus: "ACTIVE",
      availabilityStatus: "AVAILABLE"
    }),
    MaintenanceHistory.aggregate([
      {
        $group: {
          _id: null,
          totalMaintenanceCost: { $sum: "$maintenanceCost" },
          totalDowntime: { $sum: "$downtime" }
        }
      }
    ])
  ]);

  return {
    totalAssets,
    pendingRequests,
    assignedRequests,
    inProgressRequests,
    completedRequests,
    underMaintenance,
    overdueMaintenance,
    warrantyExpiring,
    availableTechnicians,
    totalMaintenanceCost: summary[0]?.totalMaintenanceCost || 0,
    totalDowntime: summary[0]?.totalDowntime || 0
  };
};

const getStaffDashboard = async (req, res, next) => {
  try {
    const filter = { reportedBy: req.user._id };
    const [myRequests, pending, assigned, inProgress, completed, recentRequests] =
      await Promise.all([
        MaintenanceRequest.countDocuments(filter),
        MaintenanceRequest.countDocuments({ ...filter, status: "PENDING" }),
        MaintenanceRequest.countDocuments({ ...filter, status: "ASSIGNED" }),
        MaintenanceRequest.countDocuments({ ...filter, status: "IN_PROGRESS" }),
        MaintenanceRequest.countDocuments({ ...filter, status: "COMPLETED" }),
        MaintenanceRequest.find(filter)
          .populate("assetId", "assetId assetName location currentStatus currentCondition")
          .populate("assignedTechnician", "userId name phone specialization")
          .sort({ createdAt: -1 })
          .limit(10)
          .lean()
      ]);

    res.json({
      success: true,
      data: {
        stats: { myRequests, pending, assigned, inProgress, completed },
        recentRequests
      }
    });
  } catch (error) {
    next(error);
  }
};

const getAdminDashboard = async (req, res, next) => {
  try {
    const recentRequests = await MaintenanceRequest.find()
      .populate("assetId", "assetId assetName location currentStatus currentCondition")
      .populate("reportedBy", "userId name department phone")
      .populate("assignedTechnician", "userId name specialization availabilityStatus")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      data: {
        stats: await getAdminStats(),
        recentRequests
      }
    });
  } catch (error) {
    next(error);
  }
};

const getTechnicianDashboard = async (req, res, next) => {
  try {
    const filter = { assignedTechnician: req.user._id };
    const [assignedRequests, inProgress, completed, recentRequests] =
      await Promise.all([
        MaintenanceRequest.countDocuments({ ...filter, status: "ASSIGNED" }),
        MaintenanceRequest.countDocuments({ ...filter, status: "IN_PROGRESS" }),
        MaintenanceRequest.countDocuments({ ...filter, status: "COMPLETED" }),
        MaintenanceRequest.find(filter)
          .populate("assetId", "assetId assetName location currentStatus currentCondition")
          .populate("reportedBy", "userId name department phone")
          .populate("assignedBy", "userId name department")
          .sort({ createdAt: -1 })
          .limit(10)
          .lean()
      ]);

    res.json({
      success: true,
      data: {
        stats: {
          assignedRequests,
          inProgress,
          completed,
          availabilityStatus: req.user.availabilityStatus
        },
        recentRequests
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStaffDashboard,
  getAdminDashboard,
  getTechnicianDashboard
};
