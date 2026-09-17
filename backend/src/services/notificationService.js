const Notification = require('../models/Notification');
const User = require('../models/User');
const { generateSequenceId } = require('../utils/generateId');
const { ROLES, NOTIFICATION_TYPE } = require('../utils/constants');

class NotificationService {
  /**
   * Create a notification for a specific user
   */
  async createNotification({ recipientId, type, title, message, relatedRequestId = null, relatedAssetId = null }) {
    try {
      const notificationId = await generateSequenceId(Notification, 'notificationId', 'NOTIF', 4);
      const notification = await Notification.create({
        notificationId,
        recipient: recipientId,
        type,
        title,
        message,
        relatedRequestId,
        relatedAssetId,
      });
      return notification;
    } catch (error) {
      console.error('[NotificationService] Error creating notification:', error.message);
      return null;
    }
  }

  /**
   * Notify all Admins (Biomedical Managers)
   */
  async notifyAdmins({ type, title, message, relatedRequestId = null, relatedAssetId = null }) {
    try {
      const admins = await User.find({ role: ROLES.ADMIN, accountStatus: 'ACTIVE' });
      const notifications = [];
      for (const admin of admins) {
        const notif = await this.createNotification({
          recipientId: admin._id,
          type,
          title,
          message,
          relatedRequestId,
          relatedAssetId,
        });
        if (notif) notifications.push(notif);
      }
      return notifications;
    } catch (error) {
      console.error('[NotificationService] Error notifying admins:', error.message);
      return [];
    }
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(userId, limit = 20) {
    return await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('relatedAssetId', 'assetId assetName location')
      .populate('relatedRequestId', 'requestId issueType priority status');
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    return await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true },
      { new: true }
    );
  }

  /**
   * Mark all notifications as read for user
   */
  async markAllAsRead(userId) {
    return await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );
  }
}

module.exports = new NotificationService();
