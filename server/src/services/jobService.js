const { ObjectId } = require("mongodb");
const jobModel=require("../models/jobModel");
const proposalModel=require("../models/proposalModel");
const AppError = require("../utils/AppError");
async function createJob({client, title, description, category, budget }){
      return await jobModel.create({
        client:client,
        title:title,
        description:description,
        category:category,
        budget:budget

    })
}
async function listJob({page: pageParam,limit:limitParam}){
    const page= Number(pageParam)||1;
     const limit = Number(limitParam) || 10;
    const skip=(page-1)*limit;
    const jobs=await jobModel.find({}).skip(skip).limit(limit);
    return jobs;



}

   async function getJob({ id }) {
    const job = await jobModel.findById(id);
    if (!job) {
        throw new AppError('Job not found', 404);
    }
    return job;
}
async function updateJob({ jobId, userId, updates }) {
  const job = await jobModel.findById(jobId);
      if (!job) {
        throw new AppError('Job not found', 404);
    }
    if (job.client.toString() !==userId){
        throw new AppError('not allowed to update job',403)
    }
    const updatedJob = await jobModel.findByIdAndUpdate(jobId, updates, { new: true });

    return updatedJob;
}
async function deleteJob({jobId,userId}){
    const job = await jobModel.findById(jobId);
      if (!job) {
        throw new AppError('Job not found', 404);
    }
    if (job.client.toString() !==userId){
        throw new AppError('not allowed to delete job',403)
    }
    const delated=await jobModel.findByIdAndDelete(jobId) ;
    return { message: 'Job deleted successfully' };


}
    


async function getMyConversations(userId) {
    const clientJobs = await jobModel
        .find({ client: userId, status: 'in_progress', acceptedProposal: { $ne: null } })
        .populate({ path: 'acceptedProposal', populate: { path: 'freelancerId', select: 'name' } });

    const freelancerProposals = await proposalModel
        .find({ freelancerId: userId, status: 'accepted' })
        .populate({ path: 'jobId', populate: { path: 'client', select: 'name' } });

    const fromClientSide = clientJobs
        .filter((job) => job.acceptedProposal && job.acceptedProposal.freelancerId)
        .map((job) => ({
            jobId: job._id,
            jobTitle: job.title,
            jobStatus: job.status,
            otherParticipant: {
                id: job.acceptedProposal.freelancerId._id,
                name: job.acceptedProposal.freelancerId.name,
            },
        }));

    const fromFreelancerSide = freelancerProposals
        .filter((p) => p.jobId && p.jobId.status === 'in_progress')
        .map((p) => ({
            jobId: p.jobId._id,
            jobTitle: p.jobId.title,
            jobStatus: p.jobId.status,
            otherParticipant: {
                id: p.jobId.client._id,
                name: p.jobId.client.name,
            },
        }));

    return [...fromClientSide, ...fromFreelancerSide];
}

module.exports={createJob,listJob,getJob,updateJob,deleteJob,getMyConversations};