const {
    platfomStat,
    getAllUsers,
    banUnbanUser,
    getUserById,
    moderatejob,
    listAllJobs,
    removeflaggedJob
}=require('../services/adminService');
async function stats(req,res,next) {
    try {
        const platformStats = await platfomStat();
        res.status(200).json({ stats: platformStats });
    } catch (error) {
        next(error);
    }
}
async function alluser(req,res,next) {
    try {
        const users = await getAllUsers();
        res.status(200).json({ users });


        
    } catch (error) {
        next(error);
        
    }}
    
async function banUnban(req,res,next) {
    try {
        const { userId } = req.params;
        const user = await banUnbanUser(userId);
        res.status(200).json({ message: `User ${user.isBlocked ? 'banned' : 'unbanned'} successfully`, user });
    } catch (error) {
        next(error);
    }
}
async function getUser(req,res,next) {
    try {
        const { userId } = req.params;
        const user = await getUserById(userId);
        res.status(200).json({ user });
    } catch (error) {
        next(error);
    }
}
async function moderateJob(req,res,next) {
    try {
        const { jobId } = req.params;
        const { status } = req.body;
        const job = await moderatejob(jobId, status);
        res.status(200).json({ message: 'Job status updated successfully', job });
    } catch (error) {
        next(error);
    }
}
async function listJobs(req,res,next) {
    try {
        const jobs = await listAllJobs();
        res.status(200).json({ jobs });
    } catch (error) {
        next(error);
    }
}
async function removeFlaggedJob(req,res,next) {
    try {
        const { jobId } = req.params;
        const result = await removeflaggedJob(jobId);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

module.exports = { stats, alluser, banUnban, getUser, moderateJob, listJobs, removeFlaggedJob };