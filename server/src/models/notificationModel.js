const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String,
        required: true,
        enum: [
            'new_proposal',
            'proposal_accepted',
            'proposal_rejected',
            'milestone_submitted',
            'milestone_completed',
            'milestone_approved',
            'milestone_rejected'
        ]
    },
    message: { type: String, required: true, trim: true },
    isRead: { type: Boolean, default: false },
    link: { type: String, trim: true }  
}, { timestamps: true });
const notificationModel = mongoose.model('Notification', notificationSchema);
module.exports = notificationModel;