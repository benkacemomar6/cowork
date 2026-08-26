const {getUserProfile,
    updateProfile,
    changePassword,
    updateImage,
    deleteAccount,
    getPublicUserProfile}=require('../controllers/userControllers')
const {authenticate}=require('../middleware/authMiddleware')
const express=require('express');
const router=express.Router();
router.get('/profile',authenticate,getUserProfile);
router.patch('/profile',authenticate,updateProfile);
router.patch('/change-password',authenticate ,changePassword);
router.patch('/avatar',authenticate,updateImage);
router.delete('/account',authenticate,deleteAccount);
router.get('/public/:userId',getPublicUserProfile);
module.exports = router;