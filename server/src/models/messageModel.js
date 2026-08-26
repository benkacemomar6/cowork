const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
}, { timestamps: true });

// speeds up "give me the thread for this job" queries, sorted chronologically
messageSchema.index({ jobId: 1, createdAt: 1 });

const messageModel = mongoose.model('Message', messageSchema);
module.exports = messageModel;
