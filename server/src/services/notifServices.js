const notificationModel = require('../models/notificationModel');
const AppError = require('../utils/AppError');

// Reusable — called from OTHER services (proposalService.accept(), 
// milestoneService.submit(), etc.) to create a notification for someone.
async function createNotification(jobId, senderId, userId, type, message) {
    const notification = new notificationModel({
        jobId,
        senderId,
        userId,
        type,
        message,
    });
    await notification.save();
    return notification;
}

// List the current user's notifications, newest first.
async function getMyNotifications(userId) {
    const notifications = await notificationModel
        .find({ userId })
        .sort({ createdAt: -1 });
    return notifications;
}

// Mark one notification as read — only the owner can mark their own.
async function markAsRead(notificationId, userId) {
    const notification = await notificationModel.findById(notificationId);
    if (!notification) throw new AppError('Notification not found', 404);

    if (notification.userId.toString() !== userId.toString()) {
        throw new AppError('You are not allowed to modify this notification', 403);
    }

    notification.isRead = true;
    await notification.save();
    return notification;
}

module.exports = {
    createNotification,
    getMyNotifications,
    markAsRead,
};