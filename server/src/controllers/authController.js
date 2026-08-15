const {registerUser,loginUser} = require('../services/authService');


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
    module.exports = { register ,login};