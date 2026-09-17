const maintenanceService = require('../services/maintenanceService');

// @desc    Get maintenance requests list
// @route   GET /api/maintenance
// @access  Private
const getRequests = async (req, res, next) => {
  try {
    const result = await maintenanceService.getRequests(req.query, req.user);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single maintenance request
// @route   GET /api/maintenance/:requestId
// @access  Private
const getRequestById = async (req, res, next) => {
  try {
    const request = await maintenanceService.getRequestById(req.params.requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Maintenance request not found' });
    }
    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new maintenance request (Staff)
// @route   POST /api/maintenance
// @access  Private (Staff, Admin)
const createRequest = async (req, res, next) => {
  try {
    const { assetId, issueType, issueDescription, priority } = req.body;

    const request = await maintenanceService.createRequest({
      assetIdentifier: assetId,
      reportedByUserId: req.user._id,
      issueType,
      issueDescription,
      priority,
    });

    res.status(201).json({
      success: true,
      message: 'Maintenance request created successfully',
      data: request,
    });
  } catch (error) {
    if (error.statusCode === 409) {
      return res.status(409).json({
        success: false,
        message: error.message,
        existingRequest: error.existingRequest,
      });
    }
    next(error);
  }
};

// @desc    Assign technician to maintenance request (Admin)
// @route   PATCH /api/maintenance/:requestId/assign
// @access  Private/Admin
const assignTechnician = async (req, res, next) => {
  try {
    const { technicianId } = req.body;

    const updatedRequest = await maintenanceService.assignTechnician({
      requestIdentifier: req.params.requestId,
      technicianIdentifier: technicianId,
      adminUserId: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: 'Technician assigned successfully',
      data: updatedRequest,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Start maintenance work (Technician)
// @route   PATCH /api/maintenance/:requestId/start
// @access  Private (Technician, Admin)
const startMaintenance = async (req, res, next) => {
  try {
    const updatedRequest = await maintenanceService.startMaintenance({
      requestIdentifier: req.params.requestId,
      userId: req.user._id,
      userRole: req.user.role,
    });

    res.status(200).json({
      success: true,
      message: 'Maintenance work marked as In Progress',
      data: updatedRequest,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete maintenance work (Technician)
// @route   PATCH /api/maintenance/:requestId/complete
// @access  Private (Technician, Admin)
const completeMaintenance = async (req, res, next) => {
  try {
    const {
      diagnosis,
      workPerformed,
      partsReplaced,
      downtime,
      maintenanceCost,
      conditionAfterMaintenance,
      result,
      remarks,
    } = req.body;

    const completionResult = await maintenanceService.completeMaintenance({
      requestIdentifier: req.params.requestId,
      userId: req.user._id,
      userRole: req.user.role,
      diagnosis,
      workPerformed,
      partsReplaced,
      downtime,
      maintenanceCost,
      conditionAfterMaintenance,
      result,
      remarks,
    });

    res.status(200).json({
      success: true,
      message: 'Maintenance completed successfully, asset state updated, and permanent history recorded',
      data: completionResult,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRequests,
  getRequestById,
  createRequest,
  assignTechnician,
  startMaintenance,
  completeMaintenance,
};
