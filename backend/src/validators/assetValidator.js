const { body } = require('express-validator');
const { ASSET_STATUS, ASSET_CONDITION, CRITICALITY, MAINTENANCE_TYPE } = require('../utils/constants');

const validateCreateAsset = [
  body('assetId').trim().notEmpty().withMessage('Asset ID is required'),
  body('assetName').trim().notEmpty().withMessage('Asset Name is required'),
  body('assetType').trim().notEmpty().withMessage('Asset Type is required'),
  body('serialNumber').trim().notEmpty().withMessage('Serial Number is required'),
  body('manufacturer').trim().notEmpty().withMessage('Manufacturer is required'),
  body('model').trim().notEmpty().withMessage('Model is required'),
  body('purchaseDate').isISO8601().withMessage('Valid Purchase Date is required'),
  body('purchaseCost').isNumeric().withMessage('Valid Purchase Cost is required'),
  body('warrantyStartDate').isISO8601().withMessage('Valid Warranty Start Date is required'),
  body('warrantyEndDate').isISO8601().withMessage('Valid Warranty End Date is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('currentStatus')
    .optional()
    .isIn(Object.values(ASSET_STATUS))
    .withMessage('Invalid asset status'),
  body('currentCondition')
    .optional()
    .isIn(Object.values(ASSET_CONDITION))
    .withMessage('Invalid asset condition'),
  body('criticality')
    .optional()
    .isIn(Object.values(CRITICALITY))
    .withMessage('Invalid criticality'),
  body('maintenanceType')
    .optional()
    .isIn(Object.values(MAINTENANCE_TYPE))
    .withMessage('Invalid maintenance type'),
];

const validateUpdateAsset = [
  body('assetName').optional().trim().notEmpty().withMessage('Asset Name cannot be empty'),
  body('currentStatus')
    .optional()
    .isIn(Object.values(ASSET_STATUS))
    .withMessage('Invalid asset status'),
  body('currentCondition')
    .optional()
    .isIn(Object.values(ASSET_CONDITION))
    .withMessage('Invalid asset condition'),
  body('department').optional().trim().notEmpty().withMessage('Department cannot be empty'),
  body('location').optional().trim().notEmpty().withMessage('Location cannot be empty'),
];

module.exports = {
  validateCreateAsset,
  validateUpdateAsset,
};
