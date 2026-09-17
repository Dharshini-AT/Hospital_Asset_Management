const mongoose = require('mongoose');
const { NOTIFICATION_TYPE } = require('../utils/constants');

const notificationSchema = new mongoose.Schema(
  {
    notificationId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required'],
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPE),
      default: NOTIFICATION_TYPE.SYSTEM_ALERT,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    relatedRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MaintenanceRequest',
      default: null,
    },
    relatedAssetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
