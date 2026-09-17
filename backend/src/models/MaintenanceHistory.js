const mongoose = require('mongoose');
const { ASSET_STATUS, ASSET_CONDITION, MAINTENANCE_TYPE } = require('../utils/constants');

const maintenanceHistorySchema = new mongoose.Schema(
  {
    historyId: {
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
      index: true,
    },
    maintenanceRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MaintenanceRequest',
      required: [true, 'Maintenance Request is required'],
      unique: true, // Exactly 1:1 relationship between completed request and history record
    },
    technicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Technician is required'],
    },
    maintenanceDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    previousStatus: {
      type: String,
      enum: Object.values(ASSET_STATUS),
      default: ASSET_STATUS.UNDER_MAINTENANCE,
    },
    issueDescription: {
      type: String,
      required: [true, 'Issue Description is required'],
      trim: true,
    },
    diagnosis: {
      type: String,
      required: [true, 'Diagnosis is required'],
      trim: true,
    },
    maintenanceType: {
      type: String,
      enum: Object.values(MAINTENANCE_TYPE),
      default: MAINTENANCE_TYPE.CORRECTIVE,
    },
    workPerformed: {
      type: String,
      required: [true, 'Work Performed is required'],
      trim: true,
    },
    partsReplaced: {
      type: String,
      trim: true,
      default: 'None',
    },
    downtime: {
      type: Number,
      required: [true, 'Downtime is required'],
      min: 0,
      default: 0,
    },
    maintenanceCost: {
      type: Number,
      required: [true, 'Maintenance Cost is required'],
      min: 0,
      default: 0,
    },
    statusAfterMaintenance: {
      type: String,
      enum: Object.values(ASSET_STATUS),
      required: true,
      default: ASSET_STATUS.AVAILABLE,
    },
    conditionAfterMaintenance: {
      type: String,
      enum: Object.values(ASSET_CONDITION),
      required: true,
      default: ASSET_CONDITION.GOOD,
    },
    result: {
      type: String,
      default: 'RESOLVED',
      trim: true,
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Immutable: no updatedAt
  }
);

const MaintenanceHistory = mongoose.model('MaintenanceHistory', maintenanceHistorySchema);
module.exports = MaintenanceHistory;
