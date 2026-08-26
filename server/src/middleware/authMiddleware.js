const jwt=require("jsonwebtoken");
const AppError=require('../utils/AppError')

function authenticate(req, res, next) {
    if (!req.headers.authorization){
        return res.status(401).json({message:"not token provided"})
    }
    const token=req.headers.authorization.split(" ")[1];
    if (!token){
        return res.status(401).json({message:"not token provided"})

    }
    try {
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        req.user=decoded
        next();

    } catch (error) {
        res.status(401).json({message: error.message})
        
    }
   

} function requireRole(role){
        return function(req,res,next){
            if (req.user.role!==role){
                return next(new AppError('You do not have permission to perform this action',403))
            }
            next();
        }
    }    
module.exports = {authenticate,requireRole} ;

