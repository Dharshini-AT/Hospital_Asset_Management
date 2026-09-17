const assetService = require('../services/assetService');
const historyService = require('../services/historyService');

// @desc    Get all assets with filtering, search, pagination
// @route   GET /api/assets
// @access  Private
const getAssets = async (req, res, next) => {
  try {
    const result = await assetService.getAssets(req.query);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single asset by ID or assetId
// @route   GET /api/assets/:assetId
// @access  Private
const getAssetById = async (req, res, next) => {
  try {
    const asset = await assetService.getAssetById(req.params.assetId);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }
    res.status(200).json({
      success: true,
      data: asset,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new asset
// @route   POST /api/assets
// @access  Private/Admin
const createAsset = async (req, res, next) => {
  try {
    const asset = await assetService.createAsset(req.body);
    res.status(201).json({
      success: true,
      message: 'Asset registered successfully',
      data: asset,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update asset
// @route   PUT /api/assets/:assetId
// @access  Private/Admin
const updateAsset = async (req, res, next) => {
  try {
    const asset = await assetService.updateAsset(req.params.assetId, req.body);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Asset updated successfully',
      data: asset,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete asset
// @route   DELETE /api/assets/:assetId
// @access  Private/Admin
const deleteAsset = async (req, res, next) => {
  try {
    const asset = await assetService.deleteAsset(req.params.assetId);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Asset deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chronological maintenance history for an asset
// @route   GET /api/assets/:assetId/history
// @access  Private
const getAssetHistory = async (req, res, next) => {
  try {
    const asset = await assetService.resolveAsset ? await assetService.resolveAsset(req.params.assetId) : await assetService.getAssetById(req.params.assetId);
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
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  getAssetHistory,
};
