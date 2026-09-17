const express = require('express');
const router = express.Router();
const {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  getAssetHistory,
} = require('../controllers/assetController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { ROLES } = require('../utils/constants');
const { validateCreateAsset, validateUpdateAsset } = require('../validators/assetValidator');
const { validate } = require('../middleware/validationMiddleware');

router.get('/', protect, getAssets);
router.get('/:assetId', protect, getAssetById);
router.get('/:assetId/history', protect, getAssetHistory);

router.post('/', protect, authorize(ROLES.ADMIN), validateCreateAsset, validate, createAsset);
router.put('/:assetId', protect, authorize(ROLES.ADMIN), validateUpdateAsset, validate, updateAsset);
router.delete('/:assetId', protect, authorize(ROLES.ADMIN), deleteAsset);

module.exports = router;
