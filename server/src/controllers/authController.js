const {registerUser,loginUser,refreshAccessToken,verifyEmail,forgotPassword,resetPassword} = require('../services/authService');


async function register(req,res,next){
    try {
        const {name,email,password,role}=req.body;
        const newuser= await registerUser({name,email,password,role})
        res.status(201).json(newuser)

    } catch (error) {
        next(error);

    }}
async function login(req,res,next) {
    try {
        const{email,password}=req.body;
        const token= await loginUser({email,password})
        res.status(200).json(token)

    } catch (error) {
        next(error);

    }

}
async function refresh(req,res,next) {
    try {
        const {refreshToken} =req.body
        const result= await refreshAccessToken({refreshToken});
        res.status(200).json(result)

    } catch (error) {
        next(error)

    }

}
async function verifyEmailController(req, res, next) {
    try {
        const { token } = req.params;
        const result = await verifyEmail(token);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}
async function forgotPasswordController(req, res, next) {
    try {
        const { email } = req.body;
        const result = await forgotPassword(email);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}
async function resetPasswordController(req, res, next) {
    try {
        const { token } = req.params;
        const { password } = req.body;
        const result = await resetPassword(token, password);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}
    module.exports = { register ,login,refresh, verifyEmailController, forgotPasswordController, resetPasswordController};
