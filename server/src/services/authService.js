const bcrypt= require('bcrypt');
const userModel=require('../models/userModel');
const AppError =require('../utils/AppError')
const jwt=require('jsonwebtoken')

async function registerUser({name,email,password,role}) {
    const user= await userModel.findOne({email:email})
    if (user) {
        throw new AppError('User already exists',409);
    }
    const hashedpass=await bcrypt.hash(password,10)
     const newuser= await userModel.create({
        name:name,
        email:email,
        password:hashedpass,
        role:role


    })
    const userobject= newuser.toObject();
    delete userobject.password;
    return userobject;


    
}
async function loginUser({email,password}) {
    const user= await userModel.findOne({email:email})
    if(!user){
        throw new AppError('user not found',404)
    }
    const istrue= await bcrypt.compare(password,user.password)
    if(!istrue){
        throw new AppError('verfy your password',401)
    }
    const token=jwt.sign(
    {userId: user._id, role:user.role},
    process.env.JWT_SECRET,
    { expiresIn: '15m' } 
    
)
return {token}
    
    
}
module.exports={registerUser,loginUser}
