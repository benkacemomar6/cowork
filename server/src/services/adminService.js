const usermodel = require('../models/userModel');
const jobModel = require('../models/jobModel');
const AppError = require('../utils/AppError');
async function platfomStat() {
    const [totalUsers, totalJobs, completedJobs] = await Promise.all([
        usermodel.countDocuments(),
        jobModel.countDocuments(),
        jobModel.countDocuments({ status: 'completed' }),
    ]);
    return { totalUsers, totalJobs, completedJobs };
}
async function getAllUsers() {
    const users = await usermodel.find();
    return users;
}
async function banUnbanUser(userId) {
    const user=await usermodel.findById(userId);
    if(!user){
        throw new AppError("user not found ",404)
    }
    user.isBlocked = !user.isBlocked;

    await user.save();
    return user;

}
async function getUserById(userId) {
    const user = await usermodel.findById(userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }
    return user;
}
async function moderatejob(jobId, status) {
    const validStatuses = ['open', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
        throw new AppError('Invalid job status', 400);
    }
    const job = await jobModel.findById(jobId);
    if (!job) {
        throw new AppError('Job not found', 404);
    }
    job.status = status;
    await job.save();
    return job;
}
async function listAllJobs() {
    const jobs = await jobModel.find().populate('client', 'name email');
    return jobs;
}
async function removeflaggedJob(jobId) {
    const job = await jobModel.findById(jobId);
    if (!job) {
        throw new AppError('Job not found', 404);
    }
    if (job.status !== 'cancelled' && job.status !== 'completed') {
        throw new AppError('Only cancelled or completed jobs can be removed', 400);

    }
    await job.deleteOne();
    return { message: 'Job removed successfully' };
}
module.exports = {
    platfomStat,
    getAllUsers,
    banUnbanUser,
    getUserById,
    moderatejob,
    listAllJobs,
    removeflaggedJob
};
