const { getMyNotifications, markAsRead } = require('../services/notifServices');

async function list(req, res, next) {
    // GET /api/notifications — protected
    try {
        const notifications = await getMyNotifications(req.user.userId);
        res.json(notifications);
    } catch (error) {
        next(error);
    }
}

async function markRead(req, res, next) {
    // PATCH /api/notifications/:id/read — protected
    try {
        const notificationId = req.params.id;
        const updatedNotification = await markAsRead(notificationId, req.user.userId);
        res.json(updatedNotification);
    } catch (error) {
        next(error);
    }
}

module.exports = { list, markRead };