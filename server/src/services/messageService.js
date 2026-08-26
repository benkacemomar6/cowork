const messageModel = require('../models/messageModel');
const jobModel = require('../models/jobModel'); // adjust path if needed
const proposalModel = require('../models/proposalModel'); // adjust path if needed
const AppError = require('../utils/AppError');

// Loads the job, resolves the hired freelancer, and confirms userId is
// either the client or the hired freelancer. Returns { job, clientId, freelancerId }.
async function resolveParticipants(jobId, userId) {
    const job = await jobModel.findById(jobId);
    if (!job) throw new AppError('Job not found', 404);

    if (job.status !== 'in_progress' || !job.acceptedProposal) {
        throw new AppError('Messaging is only available once a proposal has been accepted', 400);
    }

    const acceptedProposal = await proposalModel.findById(job.acceptedProposal);
    if (!acceptedProposal) throw new AppError('Accepted proposal not found', 404);

    const clientId = job.client.toString(); // match your real field name
    const freelancerId = acceptedProposal.freelancerId.toString();

    if (userId.toString() !== clientId && userId.toString() !== freelancerId) {
        throw new AppError('You are not a participant on this job', 403);
    }

    return { job, clientId, freelancerId };
}

async function sendMessage(jobId, senderId, content) {
    const { clientId, freelancerId } = await resolveParticipants(jobId, senderId);

    // derive receiver: whichever participant the sender isn't
    const receiverId = senderId.toString() === clientId ? freelancerId : clientId;

    const message = new messageModel({
        jobId,
        senderId,
        receiverId,
        content,
    });
    await message.save();
    return message;
}

async function getMessagesForJob(jobId, requesterId) {
    await resolveParticipants(jobId, requesterId); // throws if not a participant

    const messages = await messageModel.find({ jobId }).sort({ createdAt: 1 });
    return messages;
}

module.exports = {
    sendMessage,
    getMessagesForJob,
};