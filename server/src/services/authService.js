const bcrypt = require('bcrypt');
const crypto = require('crypto');
const userModel = require('../models/userModel');
const AppError = require('../utils/AppError')
const jwt = require('jsonwebtoken')
const { sendMail, verificationEmail, passwordResetEmail } = require('../utils/mailer')

const SELF_REGISTERABLE_ROLES = ['client', 'freelancer'];
const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1h

// Generates a random token to hand to the user (in the email link) and the
// SHA-256 hash of it to store in the DB — only the hash is ever persisted,
// so a database read can't be replayed as a working verify/reset link.
function generateHashedToken() {
    const raw = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(raw).digest('hex');
    return { raw, hash };
}

// email/password arrive as raw JSON body values — without this check a
// crafted `{"email": {"$regex": "^a"}}` payload reaches Mongoose as a query
// operator instead of a literal, turning login/register into a blind
// NoSQL-injection oracle for enumerating registered emails.
function assertCredentialShape(email, password) {
    if (typeof email !== 'string' || typeof password !== 'string') {
        throw new AppError('Invalid credentials', 400);
    }
}

async function registerUser({ name, email, password, role }) {
    assertCredentialShape(email, password)
    if (!SELF_REGISTERABLE_ROLES.includes(role)) {
        throw new AppError('Invalid role', 400);
    }
    const user = await userModel.findOne({ email: email })
    if (user) {
        throw new AppError('User already exists', 409);
    }
    const hashedpass = await bcrypt.hash(password, 10)
    const { raw: verificationToken, hash: verificationTokenHash } = generateHashedToken();
    const newuser = await userModel.create({
        name: name,
        email: email,
        password: hashedpass,
        role: role,
        verificationTokenHash,
        verificationTokenExpires: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
    })

    try {
        await sendMail(verificationEmail(newuser, verificationToken));
    } catch (err) {
        // don't fail registration just because the email couldn't be sent —
        // the user can still request a fresh link later if we add a resend endpoint
        console.error('[auth] failed to send verification email:', err.message);
    }

    const userobject = newuser.toObject();
    delete userobject.password;
    delete userobject.verificationTokenHash;
    delete userobject.verificationTokenExpires;
    return userobject;



}

async function verifyEmail(token) {
    if (typeof token !== 'string' || !token) {
        throw new AppError('Invalid verification token', 400);
    }
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await userModel.findOne({
        verificationTokenHash: tokenHash,
        verificationTokenExpires: { $gt: new Date() },
    }).select('+verificationTokenHash +verificationTokenExpires');

    if (!user) {
        throw new AppError('Invalid or expired verification link', 400);
    }

    user.isVerified = true;
    user.verificationTokenHash = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return { message: 'Email verified successfully' };
}

async function forgotPassword(email) {
    if (typeof email !== 'string') {
        throw new AppError('Invalid email', 400);
    }
    const user = await userModel.findOne({ email });

    // Always respond the same way whether or not the account exists —
    // returning a different response here is exactly the kind of oracle
    // that let the login/register endpoints leak registered emails before.
    if (user) {
        const { raw: resetToken, hash: resetPasswordTokenHash } = generateHashedToken();
        user.resetPasswordTokenHash = resetPasswordTokenHash;
        user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
        await user.save();

        try {
            await sendMail(passwordResetEmail(user, resetToken));
        } catch (err) {
            console.error('[auth] failed to send password reset email:', err.message);
        }
    }

    return { message: 'If an account exists for that email, a reset link has been sent.' };
}

async function resetPassword(token, newPassword) {
    if (typeof token !== 'string' || !token || typeof newPassword !== 'string') {
        throw new AppError('Invalid or expired reset token', 400);
    }
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await userModel.findOne({
        resetPasswordTokenHash: tokenHash,
        resetPasswordExpires: { $gt: new Date() },
    }).select('+resetPasswordTokenHash +resetPasswordExpires');

    if (!user) {
        throw new AppError('Invalid or expired reset token', 400);
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshTokens = []; // reset invalidates existing sessions
    await user.save();

    return { message: 'Password reset successfully' };
}
async function loginUser({ email, password }) {
    assertCredentialShape(email, password)
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
module.exports = { registerUser, loginUser, refreshAccessToken, verifyEmail, forgotPassword, resetPassword }
