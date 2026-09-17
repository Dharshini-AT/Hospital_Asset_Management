const { body } = require('express-validator');
const { PRIORITY, ASSET_CONDITION } = require('../utils/constants');

const validateCreateRequest = [
  body('assetId').trim().notEmpty().withMessage('Asset is required'),
  body('issueType').trim().notEmpty().withMessage('Issue Type is required'),
  body('issueDescription').trim().notEmpty().withMessage('Issue Description is required'),
  body('priority')
    .optional()
    .isIn(Object.values(PRIORITY))
    .withMessage('Priority must be LOW, MEDIUM, HIGH, or CRITICAL'),
];

const validateAssignRequest = [
  body('technicianId').trim().notEmpty().withMessage('Technician ID is required for assignment'),
];

const validateCompleteRequest = [
  body('diagnosis').trim().notEmpty().withMessage('Diagnosis is required'),
  body('workPerformed').trim().notEmpty().withMessage('Work Performed is required'),
  body('downtime').isNumeric().withMessage('Downtime in hours is required'),
  body('maintenanceCost').isNumeric().withMessage('Maintenance Cost is required'),
  body('conditionAfterMaintenance')
    .isIn(Object.values(ASSET_CONDITION))
    .withMessage('Valid condition after maintenance is required'),
  body('result').optional().trim(),
  body('partsReplaced').optional().trim(),
  body('remarks').optional().trim(),
];

module.exports = {
  validateCreateRequest,
  validateAssignRequest,
  validateCompleteRequest,
};
