const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const AppError = require('../utils/AppError')
const jwt = require('jsonwebtoken')

async function registerUser({ name, email, password, role }) {
    const user = await userModel.findOne({ email: email })
    if (user) {
        throw new AppError('User already exists', 409);
    }
    const hashedpass = await bcrypt.hash(password, 10)
    const newuser = await userModel.create({
        name: name,
        email: email,
        password: hashedpass,
        role: role


    })
    const userobject = newuser.toObject();
    delete userobject.password;
    return userobject;



}
async function loginUser({ email, password }) {
    const user = await userModel.findOne({ email: email })
    if (!user) {
        throw new AppError('user not found', 404)
    }
    const istrue = await bcrypt.compare(password, user.password)
    if (!istrue) {
        throw new AppError('verfy your password', 401)
    }
    const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }


    )
    const refreshToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );

   if (!user.refreshTokens) {
    user.refreshTokens = [];
     await user.save();
}
    user.refreshTokens.push(refreshToken);
    const userObject=user.toObject();
    delete userObject.password;
    await user.save();

    return { token, refreshToken ,user:userObject};
    


}
async function refreshAccessToken({refreshToken}) {
    let decoded;
    try {
        decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
        throw new AppError('Invalid or expired refresh token', 401);
    }

    const user = await userModel.findById(decoded.userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    if (!user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
    throw new AppError('Refresh token has been revoked', 401);
}

    const newAccessToken = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    return { token: newAccessToken };
}
module.exports = { registerUser, loginUser,refreshAccessToken }
