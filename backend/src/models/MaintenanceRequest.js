const mongoose = require('mongoose');
const { MAINTENANCE_STATUS, PRIORITY, ASSET_CONDITION } = require('../utils/constants');

const maintenanceRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: [true, 'Asset is required'],
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter is required'],
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedTechnician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    issueType: {
      type: String,
      required: [true, 'Issue Type is required'],
      trim: true,
    },
    issueDescription: {
      type: String,
      required: [true, 'Issue Description is required'],
      trim: true,
    },
    priority: {
      type: String,
      enum: Object.values(PRIORITY),
      default: PRIORITY.MEDIUM,
    },
    status: {
      type: String,
      enum: Object.values(MAINTENANCE_STATUS),
      default: MAINTENANCE_STATUS.PENDING,
      index: true,
    },
    reportedAt: {
      type: Date,
      default: Date.now,
    },
    assignedAt: {
      type: Date,
      default: null,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    diagnosis: {
      type: String,
      trim: true,
      default: '',
    },
    workPerformed: {
      type: String,
      trim: true,
      default: '',
    },
    partsReplaced: {
      type: String,
      trim: true,
      default: '',
    },
    downtime: {
      type: Number,
      default: 0,
      min: 0,
    },
    maintenanceCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    conditionAfterMaintenance: {
      type: String,
      enum: [...Object.values(ASSET_CONDITION), ''],
      default: '',
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Database-level enforcement of DUPLICATE PREVENTION:
// Only one active maintenance request allowed per asset for PENDING, ASSIGNED, or IN_PROGRESS
maintenanceRequestSchema.index(
  { assetId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: [MAINTENANCE_STATUS.PENDING, MAINTENANCE_STATUS.ASSIGNED, MAINTENANCE_STATUS.IN_PROGRESS] },
    },
  }
);

const MaintenanceRequest = mongoose.model('MaintenanceRequest', maintenanceRequestSchema);
module.exports = MaintenanceRequest;
