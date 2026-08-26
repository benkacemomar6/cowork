const {getuserById,
    updateUserProfile,
    changeUserPassword,
    updateProfileImage,
    deleteUserAccount,
    getPublicProfile} = require('../services/userServices');
async function getUserProfile(req,res,next){
    try {
        const userId = req.user.userId;
        const userProfile = await getuserById(userId);
        res.status(200).json({ success: true, data: userProfile });
    } catch (error) {
        next(error);
    }
}
async function updateProfile(req,res,next){
    try {
        const userId = req.user.userId;
        const updateData = req.body;
        const updatedProfile = await updateUserProfile(userId, updateData);
        res.status(200).json({ success: true, data: updatedProfile });
    } catch (error) {
        next(error);
    }
}
async function changePassword(req,res,next){
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;
        const updatedUser = await changeUserPassword(userId, currentPassword, newPassword);
        res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
        next(error);
    }
}
async function updateImage(req,res,next){
    try {
        const userId = req.user.userId;
        const profileImageUrl = req.body.profileImageUrl; // Assuming you're using multer for file uploads
        const updatedUser = await updateProfileImage(userId, profileImageUrl);
        res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
        next(error);
    }   
}
async function deleteAccount(req,res,next){
    try {
        const userId = req.user.userId;
        const result = await deleteUserAccount(userId);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
}
async function getPublicUserProfile(req,res,next){
    try {
        const userId = req.params.userId;
        const publicProfile = await getPublicProfile(userId);
        res.status(200).json({ success: true, data: publicProfile });
    } catch (error) {
        next(error);
    }   
}
module.exports = {
    getUserProfile,
    updateProfile,
    changePassword,
    updateImage,
    deleteAccount,
    getPublicUserProfile
}