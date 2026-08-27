const express=require('express');
const {authenticate}=require("../middleware/authMiddleware")
const router=express.Router();
const {register,login,refresh,verifyEmailController,forgotPasswordController,resetPasswordController}= require("../controllers/authController")
router.get('/me', authenticate, (req, res) => {
    res.json({ message: 'You are authenticated!', user: req.user });
});
router.post("/register",register);
router.post("/login",login);
router.post('/refresh', refresh);
router.post('/verify-email/:token', verifyEmailController);
router.post('/forgot-password', forgotPasswordController);
router.post('/reset-password/:token', resetPasswordController);

module.exports=router
