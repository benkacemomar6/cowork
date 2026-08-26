const millModel=require("../models/milestoneModel");
const proposalModel=require("../models/proposalModel");
const jobModel=require("../models/jobModel");
const AppError=require('../utils/AppError');
const {createNotification}=require('../services/notifServices')
async function createMilestone({jobId,userId,title,description,amount}) {
    const job=await jobModel.findById(jobId);
    if (!job){
        throw new AppError("there is no job with this id", 404)
    }
    if (job.client.toString() !== userId) {
        throw new AppError('You are not allowed to create milestones for this job', 403);
    }
    if (job.status !== 'in_progress') {
        throw new AppError('Cannot create milestone for a job that is not in progress', 400);
    } 
    
    const milestone=await millModel.create({jobId,title,description,amount})

    return milestone;
}
async function submitMilestone({milestoneId,freelancerId,deliverableUrl}) {
    const milestone=await millModel.findById(milestoneId);
    if (!milestone){
        throw new AppError("there is no milestone with this id", 404)
    }
    const job=await jobModel.findById(milestone.jobId)
    if (!job){
        throw new AppError("there is no job with this id", 404)
    }
    if (job.status !== 'in_progress') {
        throw new AppError('Cannot submit milestone for a job that is not in progress', 400);
    }

   const proposal = await proposalModel.findById(job.acceptedProposal);
    if (!proposal) {
        throw new AppError('No accepted proposal found for this job', 404);
    }
    if (proposal.freelancerId.toString() !== freelancerId) {
        throw new AppError('You are not allowed to submit milestones for this job', 403);
    }

    const submittedMilestone = await millModel.findByIdAndUpdate(milestoneId, {status:'submitted', deliverableUrl}, {new:true})

    await createNotification(
        job._id,
        freelancerId,
        job.client,
        'milestone_submitted',
        'A milestone has been submitted for your review.'
    );

    return submittedMilestone;

}
async function approveMilestone({milestoneId, userId}) {
    const milestone=await millModel.findById(milestoneId);
    if (!milestone){
        throw new AppError("there is no milestone with this id", 404)
    }
    const job=await jobModel.findById(milestone.jobId)
    if (!job){
        throw new AppError("there is no job with this id", 404)
    }
    if (job.client.toString() !== userId) {
        throw new AppError('You are not allowed to approve milestones for this job', 403);
    }
    if (milestone.status !== 'submitted') {
        throw new AppError('Cannot approve a milestone that has not been submitted', 400);
    }
    const approvedMilestone = await millModel.findByIdAndUpdate(milestoneId, {status:'approved', approvedAt: new Date()}, {new:true})
   const proposal = await proposalModel.findById(job.acceptedProposal);
    if (proposal) {
        await createNotification(
            job._id,
            userId,
            proposal.freelancerId,
            'milestone_approved',
            'Your submitted milestone has been approved!'
        );
    }

    return approvedMilestone;
}
async function requestRevision({milestoneId, userId}) {
    const milestone=await millModel.findById(milestoneId);
    if (!milestone){
        throw new AppError("there is no milestone with this id", 404)
    }
    const job=await jobModel.findById(milestone.jobId)
    if (!job){
        throw new AppError("there is no job with this id", 404)
    }
    if (job.client.toString() !== userId) {
        throw new AppError('You are not allowed to request revisions for this job', 403);
    }
    if (milestone.status !== 'submitted') {
        throw new AppError('Cannot request revision for a milestone that has not been submitted', 400);
    }
    const revisionRequestedMilestone = await millModel.findByIdAndUpdate(milestoneId, {status:'revision_requested'}, {new:true})
    return revisionRequestedMilestone;
}module.exports = { createMilestone, submitMilestone, approveMilestone, requestRevision };