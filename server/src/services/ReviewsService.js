const reviewmodel = require('../models/reviewsModel');
const jobModel = require('../models/jobModel');
const proposalModel = require('../models/proposalModel');
const userModel = require('../models/userModel');
const AppError = require('../utils/AppError');
async function createReview({reviewerId, jobId, rating, comment}) {
    const job = await jobModel.findById(jobId);
    if (!job) {
        throw new AppError('Job not found', 404);
    }
    if (job.status !== 'completed') {
        throw new AppError('You can only review a completed job', 400);
    }

    const proposal = await proposalModel.findById(job.acceptedProposal);
    if (!proposal) {
        throw new AppError('No accepted proposal found for this job', 404);
    }

    const clientId = job.client.toString();
    const freelancerId = proposal.freelancerId.toString();

    let revieweeId;
    if (reviewerId === clientId) {
        revieweeId = freelancerId;
    } else if (reviewerId === freelancerId) {
        revieweeId = clientId;
    } else {
        throw new AppError('You are not authorized to review this job', 403);
    }

    const review = await reviewmodel.create({ reviewer: reviewerId, reviewee: revieweeId, rating, comment, jobId });
    return review;

}
async function getReviewsByUserId(userId) {
    const reviews = await reviewmodel.find({ reviewee: userId }).populate('reviewer', 'name profileImage');
    return reviews;
}
module.exports={createReview,getReviewsByUserId};
