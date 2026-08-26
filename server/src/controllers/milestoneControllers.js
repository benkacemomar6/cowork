const { createMilestone, submitMilestone, approveMilestone, requestRevision } = require('../services/MilestonesServices');
async function submit(req, res, next) {
    try {
        const milestoneId = req.params.id;
        const freelancerId = req.user.userId;
        const { deliverableUrl } = req.body;
        const submittedMilestone = await submitMilestone({ milestoneId, freelancerId, deliverableUrl });
        res.status(200).json({ status: 'success', data: { submittedMilestone } });
    } catch (error) {
        next(error);
    }
}

async function approve(req, res, next) {
    try {
        const milestoneId = req.params.id;
        const userId = req.user.userId;
        const approvedMilestone = await approveMilestone({ milestoneId, userId });
        res.status(200).json({ status: 'success', data: { approvedMilestone } });
    } catch (error) {
        next(error);
    }
}

async function revision(req, res, next) {
    try {
        const milestoneId = req.params.id;
        const userId = req.user.userId;
        const revisedMilestone = await requestRevision({ milestoneId, userId });
        res.status(200).json({ status: 'success', data: { revisedMilestone } });
    } catch (error) {
        next(error);
    }
}
async function create(req, res, next) {
    try {
        const jobId = req.params.jobId;
        const userId = req.user.userId;
        const { title, description, amount } = req.body;
        const milestone = await createMilestone({ jobId, userId, title, description, amount });
        res.status(201).json({ status: 'success', data: { milestone } });
    } catch (error) {
        next(error);
    }
}

module.exports = { create, submit, approve, revision };