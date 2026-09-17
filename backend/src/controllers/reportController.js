const Asset = require('../models/Asset');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const MaintenanceHistory = require('../models/MaintenanceHistory');
const User = require('../models/User');
const { ROLES } = require('../utils/constants');

// @desc    Get comprehensive hospital operational reports
// @route   GET /api/reports/operational
// @access  Private/Admin
const getOperationalReports = async (req, res, next) => {
  try {
    const now = new Date();
    const in30Days = new Date();
    in30Days.setDate(now.getDate() + 30);

    // 1. Asset Distribution Reports
    const [assetsByType, assetsByDept, assetsByStatus, assetsByCondition] = await Promise.all([
      Asset.aggregate([{ $group: { _id: '$assetType', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Asset.aggregate([{ $group: { _id: '$department', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Asset.aggregate([{ $group: { _id: '$currentStatus', count: { $sum: 1 } } }]),
      Asset.aggregate([{ $group: { _id: '$currentCondition', count: { $sum: 1 } } }]),
    ]);

    // 2. Maintenance Status & Types Breakdown
    const [maintenanceByStatus, maintenanceByType] = await Promise.all([
      MaintenanceRequest.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      MaintenanceHistory.aggregate([{ $group: { _id: '$maintenanceType', count: { $sum: 1 } } }]),
    ]);

    // 3. Cost & Downtime Metrics
    const [costSummary, costByDept, downtimeByAsset, costByAsset] = await Promise.all([
      MaintenanceHistory.aggregate([
        {
          $group: {
            _id: null,
            totalCost: { $sum: '$maintenanceCost' },
            totalDowntime: { $sum: '$downtime' },
            totalEvents: { $sum: 1 },
          },
        },
      ]),
      MaintenanceHistory.aggregate([
        {
          $lookup: {
            from: 'assets',
            localField: 'assetId',
            foreignField: '_id',
            as: 'asset',
          },
        },
        { $unwind: '$asset' },
        {
          $group: {
            _id: '$asset.department',
            totalCost: { $sum: '$maintenanceCost' },
            totalDowntime: { $sum: '$downtime' },
            count: { $sum: 1 },
          },
        },
        { $sort: { totalCost: -1 } },
      ]),
      MaintenanceHistory.aggregate([
        {
          $lookup: {
            from: 'assets',
            localField: 'assetId',
            foreignField: '_id',
            as: 'asset',
          },
        },
        { $unwind: '$asset' },
        {
          $group: {
            _id: '$asset.assetId',
            assetName: { $first: '$asset.assetName' },
            department: { $first: '$asset.department' },
            totalDowntime: { $sum: '$downtime' },
            eventCount: { $sum: 1 },
          },
        },
        { $sort: { totalDowntime: -1 } },
        { $limit: 10 },
      ]),
      MaintenanceHistory.aggregate([
        {
          $lookup: {
            from: 'assets',
            localField: 'assetId',
            foreignField: '_id',
            as: 'asset',
          },
        },
        { $unwind: '$asset' },
        {
          $group: {
            _id: '$asset.assetId',
            assetName: { $first: '$asset.assetName' },
            department: { $first: '$asset.department' },
            totalCost: { $sum: '$maintenanceCost' },
            eventCount: { $sum: 1 },
          },
        },
        { $sort: { totalCost: -1 } },
        { $limit: 10 },
      ]),
    ]);

    // 4. Technician Performance & Workload
    const technicians = await User.find({ role: ROLES.TECHNICIAN, accountStatus: 'ACTIVE' }).select(
      'userId name specialization availabilityStatus'
    );
    const techPerformance = await Promise.all(
      technicians.map(async (tech) => {
        const [assigned, inProgress, completed] = await Promise.all([
          MaintenanceRequest.countDocuments({ assignedTechnician: tech._id, status: 'ASSIGNED' }),
          MaintenanceRequest.countDocuments({ assignedTechnician: tech._id, status: 'IN_PROGRESS' }),
          MaintenanceRequest.countDocuments({ assignedTechnician: tech._id, status: 'COMPLETED' }),
        ]);
        return {
          technician: tech,
          assigned,
          inProgress,
          completed,
          totalWorkload: assigned + inProgress,
        };
      })
    );

    // 5. Warranty Report
    const [activeWarranties, expiringWarranties, expiredWarranties] = await Promise.all([
      Asset.countDocuments({ warrantyEndDate: { $gt: in30Days } }),
      Asset.countDocuments({ warrantyEndDate: { $gte: now, $lte: in30Days } }),
      Asset.countDocuments({ warrantyEndDate: { $lt: now } }),
    ]);

    // 6. Asset Reliability: Repeated Failures
    const frequentFailures = await MaintenanceHistory.aggregate([
      {
        $group: {
          _id: '$assetId',
          failureCount: { $sum: 1 },
          totalCost: { $sum: '$maintenanceCost' },
          totalDowntime: { $sum: '$downtime' },
        },
      },
      { $match: { failureCount: { $gte: 1 } } },
      { $sort: { failureCount: -1, totalCost: -1 } },
      { $limit: 8 },
      {
        $lookup: {
          from: 'assets',
          localField: '_id',
          foreignField: '_id',
          as: 'asset',
        },
      },
      { $unwind: '$asset' },
      {
        $project: {
          assetId: '$asset.assetId',
          assetName: '$asset.assetName',
          department: '$asset.department',
          model: '$asset.model',
          currentCondition: '$asset.currentCondition',
          currentStatus: '$asset.currentStatus',
          failureCount: 1,
          totalCost: 1,
          totalDowntime: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        assetDistribution: {
          byType: assetsByType,
          byDepartment: assetsByDept,
          byStatus: assetsByStatus,
          byCondition: assetsByCondition,
        },
        maintenanceBreakdown: {
          byStatus: maintenanceByStatus,
          byType: maintenanceByType,
        },
        costAndDowntime: {
          summary: costSummary[0] || { totalCost: 0, totalDowntime: 0, totalEvents: 0 },
          byDepartment: costByDept,
          topDowntimeAssets: downtimeByAsset,
          topCostAssets: costByAsset,
        },
        technicianWorkload: techPerformance,
        warrantyReport: {
          active: activeWarranties,
          expiringSoon: expiringWarranties,
          expired: expiredWarranties,
        },
        assetReliability: {
          frequentlyRepaired: frequentFailures,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOperationalReports,
};
