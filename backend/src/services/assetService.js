const Asset = require('../models/Asset');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const MaintenanceHistory = require('../models/MaintenanceHistory');
const { ASSET_STATUS, MAINTENANCE_STATUS } = require('../utils/constants');
const { calculateWarrantyStatus, calculateNextMaintenanceDate } = require('../utils/dateUtils');

class AssetService {
  /**
   * Get assets with comprehensive filtering, search, sorting, and pagination
   */
  async getAssets(query = {}) {
    const {
      search,
      department,
      currentStatus,
      currentCondition,
      criticality,
      assetType,
      warrantyStatus,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const filter = {};

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { assetId: searchRegex },
        { assetName: searchRegex },
        { serialNumber: searchRegex },
        { model: searchRegex },
        { manufacturer: searchRegex },
        { location: searchRegex },
      ];
    }

    if (department) filter.department = department;
    if (currentStatus) filter.currentStatus = currentStatus;
    if (currentCondition) filter.currentCondition = currentCondition;
    if (criticality) filter.criticality = criticality;
    if (assetType) filter.assetType = assetType;

    // Filter by warranty status if specified
    if (warrantyStatus) {
      const now = new Date();
      const in30Days = new Date();
      in30Days.setDate(now.getDate() + 30);

      if (warrantyStatus === 'EXPIRED') {
        filter.warrantyEndDate = { $lt: now };
      } else if (warrantyStatus === 'EXPIRING_SOON') {
        filter.warrantyEndDate = { $gte: now, $lte: in30Days };
      } else if (warrantyStatus === 'ACTIVE') {
        filter.warrantyEndDate = { $gt: in30Days };
      }
    }

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [assets, total] = await Promise.all([
      Asset.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit, 10)),
      Asset.countDocuments(filter),
    ]);

    // Attach active maintenance requests info for quick display in UI
    const assetIds = assets.map((a) => a._id);
    const activeRequests = await MaintenanceRequest.find({
      assetId: { $in: assetIds },
      status: { $in: [MAINTENANCE_STATUS.PENDING, MAINTENANCE_STATUS.ASSIGNED, MAINTENANCE_STATUS.IN_PROGRESS] },
    }).populate('assignedTechnician', 'name userId');

    const activeMap = {};
    activeRequests.forEach((req) => {
      activeMap[req.assetId.toString()] = req;
    });

    const assetsWithActiveInfo = assets.map((asset) => {
      const obj = asset.toObject();
      obj.activeRequest = activeMap[asset._id.toString()] || null;
      obj.warrantyStatus = calculateWarrantyStatus(asset.warrantyEndDate);
      return obj;
    });

    return {
      assets: assetsWithActiveInfo,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10)),
    };
  }

  /**
   * Get single asset by assetId or _id with detailed active request and maintenance summary
   */
  async getAssetById(id) {
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const filter = isObjectId ? { _id: id } : { assetId: id.toUpperCase() };

    const asset = await Asset.findOne(filter);
    if (!asset) return null;

    // Fetch any active maintenance request
    const activeRequest = await MaintenanceRequest.findOne({
      assetId: asset._id,
      status: { $in: [MAINTENANCE_STATUS.PENDING, MAINTENANCE_STATUS.ASSIGNED, MAINTENANCE_STATUS.IN_PROGRESS] },
    })
      .populate('reportedBy', 'name userId email phone department')
      .populate('assignedTechnician', 'name userId email phone specialization')
      .populate('assignedBy', 'name userId');

    // Fetch maintenance summary stats (total downtime, total cost, count of completed maintenance)
    const historySummary = await MaintenanceHistory.aggregate([
      { $match: { assetId: asset._id } },
      {
        $group: {
          _id: '$assetId',
          totalMaintenanceCount: { $sum: 1 },
          totalDowntime: { $sum: '$downtime' },
          totalCost: { $sum: '$maintenanceCost' },
        },
      },
    ]);

    const result = asset.toObject();
    result.activeRequest = activeRequest || null;
    result.maintenanceStats = historySummary[0] || {
      totalMaintenanceCount: 0,
      totalDowntime: 0,
      totalCost: 0,
    };
    result.warrantyStatus = calculateWarrantyStatus(asset.warrantyEndDate);

    return result;
  }

  /**
   * Create a new asset
   */
  async createAsset(data) {
    // Check if nextMaintenanceDate needs to be calculated
    if (!data.nextMaintenanceDate && data.installationDate) {
      data.nextMaintenanceDate = calculateNextMaintenanceDate(data.installationDate, data.maintenanceFrequency);
    }
    const asset = await Asset.create(data);
    return asset;
  }

  /**
   * Update an existing asset
   */
  async updateAsset(id, updateData) {
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const filter = isObjectId ? { _id: id } : { assetId: id.toUpperCase() };

    const asset = await Asset.findOneAndUpdate(filter, updateData, {
      new: true,
      runValidators: true,
    });
    return asset;
  }

  /**
   * Delete an asset
   */
  async deleteAsset(id) {
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const filter = isObjectId ? { _id: id } : { assetId: id.toUpperCase() };

    return await Asset.findOneAndDelete(filter);
  }
}

module.exports = new AssetService();
