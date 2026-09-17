const express = require('express');
const router = express.Router();
const {
  getRequests,
  getRequestById,
  createRequest,
  assignTechnician,
  startMaintenance,
  completeMaintenance,
} = require('../controllers/maintenanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { ROLES } = require('../utils/constants');
const {
  validateCreateRequest,
  validateAssignRequest,
  validateCompleteRequest,
} = require('../validators/maintenanceValidator');
const { validate } = require('../middleware/validationMiddleware');

router.get('/', protect, getRequests);
router.get('/:requestId', protect, getRequestById);

// Staff and Admin can report an issue
router.post('/', protect, authorize(ROLES.STAFF), validateCreateRequest, validate, createRequest);

// Only Admin can assign technician
router.patch('/:requestId/assign', protect, authorize(ROLES.ADMIN), validateAssignRequest, validate, assignTechnician);

// Technician and Admin can start maintenance
router.patch('/:requestId/start', protect, authorize(ROLES.TECHNICIAN), startMaintenance);

// Technician and Admin can complete maintenance
router.patch(
  '/:requestId/complete',
  protect,
  authorize(ROLES.TECHNICIAN),
  validateCompleteRequest,
  validate,
  completeMaintenance
);

module.exports = router;
