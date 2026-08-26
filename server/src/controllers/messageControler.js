const { sendMessage, getMessagesForJob } = require('../services/messageService');

async function sendMessageController(req, res, next) {
    try {
        const { jobId } = req.params;
        const senderId = req.user.userId;
        const { content } = req.body;

        const message = await sendMessage(jobId, senderId, content);
        res.status(201).json({ success: true, data: message });
    } catch (error) {
        next(error);
    }
}

async function getMessagesController(req, res, next) {
    try {
        const { jobId } = req.params;
        const requesterId = req.user.userId;

        const messages = await getMessagesForJob(jobId, requesterId);
        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    sendMessageController,
    getMessagesController,
};