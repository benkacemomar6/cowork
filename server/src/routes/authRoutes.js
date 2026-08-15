const express=require('express');
const {authenticate}=require("../middleware/authMiddleware")
const router=express.Router();
const {register,login}= require("../controllers/authController")
router.get('/me', authenticate, (req, res) => {
    res.json({ message: 'You are authenticated!', user: req.user });
});
router.post("/register",register);
router.post("/login",login);

module.exports=router
