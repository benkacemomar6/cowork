const usermodel = require('../models/userModel');
const jobModel = require('../models/jobModel');
const AppError = require('../utils/AppError');
const bcrypt = require('bcrypt');
async function getuserById(userId) {
    const user = await usermodel.findById(userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }
    const userobject = user.toObject();
    delete userobject.password;
    return userobject;
}



async function updateUserProfile(userId, updateData) {
    const user = await usermodel.findById(userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    const allowedFields = ['name', 'bio', 'skills'];
    for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
            user[field] = updateData[field];
        }
    }

    await user.save();
    const userobject = user.toObject();
    delete userobject.password;
    return userobject;
}
async function changeUserPassword(userId, currentPassword, newPassword) {
    const user = await usermodel.findById(userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        throw new AppError('Current password is incorrect', 400);
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    const userobject = user.toObject();
    delete userobject.password;
    return userobject;

}
async function updateProfileImage(userId, profileImageUrl) {
    const user = await usermodel.findById(userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }
    user.profileImage = profileImageUrl;
    await user.save();
    const userobject = user.toObject();
    delete userobject.password;
    return userobject;
}
async function deleteUserAccount(userId) {
    const user = await usermodel.findById(userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }
    await usermodel.findByIdAndDelete(userId);
    return { message: 'User account deleted successfully' };
}
async function getPublicProfile(userId) {
    const user = await usermodel.findById(userId).select('-password');
    if (!user) {
        throw new AppError('User not found', 404);
    }   
    return user;
}
module.exports = {
    getuserById,
    updateUserProfile,
    changeUserPassword,
    updateProfileImage,
    deleteUserAccount,
    getPublicProfile
};