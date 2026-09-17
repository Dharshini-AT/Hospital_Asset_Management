const mongoose = require('mongoose');
const { ASSET_STATUS, ASSET_CONDITION, CRITICALITY, MAINTENANCE_TYPE } = require('../utils/constants');
const { calculateWarrantyStatus, getDaysUntilWarrantyExpires } = require('../utils/dateUtils');

const assetSchema = new mongoose.Schema(
  {
    assetId: {
      type: String,
      required: [true, 'Asset ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    assetName: {
      type: String,
      required: [true, 'Asset Name is required'],
      trim: true,
    },
    assetType: {
      type: String,
      required: [true, 'Asset Type is required'],
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: 'Medical Equipment',
    },
    serialNumber: {
      type: String,
      required: [true, 'Serial Number is required'],
      unique: true,
      trim: true,
    },
    manufacturer: {
      type: String,
      required: [true, 'Manufacturer is required'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'Model is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    purchaseDate: {
      type: Date,
      required: [true, 'Purchase Date is required'],
    },
    purchaseCost: {
      type: Number,
      required: [true, 'Purchase Cost is required'],
      min: 0,
    },
    supplier: {
      type: String,
      trim: true,
      default: '',
    },
    installationDate: {
      type: Date,
      default: Date.now,
    },
    warrantyStartDate: {
      type: Date,
      required: [true, 'Warranty Start Date is required'],
    },
    warrantyEndDate: {
      type: Date,
      required: [true, 'Warranty End Date is required'],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    ward: {
      type: String,
      trim: true,
      default: '',
    },
    room: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    maintenanceFrequency: {
      type: String,
      default: 'QUARTERLY',
      trim: true,
    },
    maintenanceType: {
      type: String,
      enum: Object.values(MAINTENANCE_TYPE),
      default: MAINTENANCE_TYPE.PREVENTIVE,
    },
    lastMaintenanceDate: {
      type: Date,
      default: null,
    },
    nextMaintenanceDate: {
      type: Date,
      default: null,
    },
    currentStatus: {
      type: String,
      enum: Object.values(ASSET_STATUS),
      default: ASSET_STATUS.AVAILABLE,
    },
    currentCondition: {
      type: String,
      enum: Object.values(ASSET_CONDITION),
      default: ASSET_CONDITION.GOOD,
    },
    criticality: {
      type: String,
      enum: Object.values(CRITICALITY),
      default: CRITICALITY.MEDIUM,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for calculated warranty status
assetSchema.virtual('warrantyStatus').get(function () {
  return calculateWarrantyStatus(this.warrantyEndDate);
});

// Virtual for remaining warranty days
assetSchema.virtual('daysUntilWarrantyExpires').get(function () {
  return getDaysUntilWarrantyExpires(this.warrantyEndDate);
});

// Compound indexes for fast searching and filtering
assetSchema.index({ department: 1, currentStatus: 1 });
assetSchema.index({ assetName: 'text', assetId: 'text', model: 'text', manufacturer: 'text' });

const Asset = mongoose.model('Asset', assetSchema);
module.exports = Asset;
