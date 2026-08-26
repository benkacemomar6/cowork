const ProposalModel=require('../models/proposalModel')
const jobModel=require('../models/jobModel')
const AppError=require('../utils/AppError');
const {createNotification}=require('./notifServices')
async function submitProposal({jobId,freelancerId,coverLetter,bidAmount}) {
    const job = await jobModel.findById(jobId);
    if (!job) {
        throw new AppError("there is no job with this id", 404)
    }
    if (job.status !== 'open') {
        throw new AppError('This job is no longer accepting proposals', 400);
    }

    
    const propsal = await ProposalModel.create({ jobId, freelancerId, coverLetter, bidAmount })
    const notification = await createNotification(
        jobId,
        freelancerId,
        job.client,
        'new_proposal',
        'A new proposal has been submitted for your job.'
    );
    return propsal

}
      
async function listProposalsForJob({jobId,userId}) {
    const job = await jobModel.findById(jobId);
    if (!job) {
        throw new AppError("there is no job with this id", 404)
    }
    if (job.client.toString()!==userId){
        throw new AppError("only the job owner can see proposals",403)
    }
    const propos=await  ProposalModel.find({jobId});
    return propos


    
}
async function listMyProposals({freelancerId}){
    const propos =await ProposalModel.find({freelancerId})
    return propos;

}
async function acceptProposal({ proposalId, userId }) {
    const prop= await ProposalModel.findById(proposalId);
    if (!prop){
        throw new AppError("there is no proposal with this id", 404)
    }
    const job=await jobModel.findById(prop.jobId)
    if (!job){
        throw new AppError("not found", 404)
    }
    if (job.client.toString() !== userId){
        throw new AppError('You are not allowed to accept proposals on this job', 403)
    }
    prop.status='accepted'
    await prop.save();

    // find the sibling proposals BEFORE rejecting them, so we still know who they belong to
    const siblingProposals = await ProposalModel.find(
        { jobId: job._id, _id: { $ne: prop._id } }
    );

    const reject = await ProposalModel.updateMany(
        { jobId: job._id, _id: { $ne: prop._id } },
        { status: 'rejected' }
    );
    job.status = 'in_progress';
    job.acceptedProposal = prop._id;
    await job.save();

    // notify the accepted freelancer
    await createNotification(
        job._id,
        userId,
        prop.freelancerId,
        'proposal_accepted',
        'Your proposal has been accepted!'
    );

    // notify every rejected sibling
    for (const sibling of siblingProposals) {
        await createNotification(
            job._id,
            userId,
            sibling.freelancerId,
            'proposal_rejected',
            'Your proposal was not selected for this job.'
        );
    }

    return { job, prop };
}




async function rejectProposal({proposalId,userId}){
    const prop=await ProposalModel.findById(proposalId);
     if (!prop){
        throw new AppError("there is no proposal with this id", 404)
    
    }
    const job= await jobModel.findById(prop.jobId);
    if (!job) {
    throw new AppError("Job not found", 404);
}

    if (job.client.toString() !== userId){
        throw new AppError('You are not allowed to reject proposals on this job', 403)

    }
    prop.status='rejected'
    await prop.save();
      await createNotification(
        job._id,
        userId,
        prop.freelancerId,
        'proposal_rejected',
        'Your proposal has been rejected.'
    );


return { job, prop };

}
async function withdrawProposal({ proposalId, userId }) {
    const proposal = await ProposalModel.findById(proposalId);
    if (!proposal) {
        throw new AppError('Proposal not found', 404);
    }

    if (proposal.freelancerId.toString() !== userId) {
        throw new AppError('You are not allowed to withdraw this proposal', 403);
    }

    if (proposal.status !== 'pending') {
        throw new AppError('You can only withdraw a pending proposal', 400);
    }

    proposal.status = 'withdrawn';
    await proposal.save();

    return { message: 'Proposal withdrawn successfully', proposal };
}


module.exports = { submitProposal, listProposalsForJob, listMyProposals, acceptProposal,withdrawProposal,rejectProposal };