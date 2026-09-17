const historyService = require('../services/historyService');
const Asset = require('../models/Asset');

// @desc    Get all permanent maintenance histories
// @route   GET /api/history
// @access  Private (Admin, Technician)
const getAllHistories = async (req, res, next) => {
  try {
    const result = await historyService.getAllHistories(req.query);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single permanent maintenance history record
// @route   GET /api/history/:historyId
// @access  Private
const getHistoryById = async (req, res, next) => {
  try {
    const record = await historyService.getHistoryById(req.params.historyId);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Maintenance history record not found' });
    }
    res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get permanent maintenance history for an asset
// @route   GET /api/history/asset/:assetId
// @access  Private
const getAssetHistory = async (req, res, next) => {
  try {
    const { assetId } = req.params;
    const isObjectId = assetId.match(/^[0-9a-fA-F]{24}$/);
    const filter = isObjectId ? { _id: assetId } : { assetId: assetId.toUpperCase() };

    const asset = await Asset.findOne(filter);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const history = await historyService.getAssetHistory(asset._id);
    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllHistories,
  getHistoryById,
  getAssetHistory,
};
