const nodemailer = require('nodemailer');

let transporter = null;
let warnedNoTransport = false;

// Lazy — built on first send so a missing SMTP config doesn't crash the
// app at require-time, only the send itself degrades (see sendMail below).
function getTransporter() {
    if (transporter) return transporter;
    if (!process.env.SMTP_HOST) return null;

    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: process.env.SMTP_USER
            ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
            : undefined,
    });
    return transporter;
}

// Sends an email if SMTP_HOST is configured; otherwise logs to the
// console so auth flows (register/forgot-password) still work end to end
// in local dev before real SMTP credentials are added to .env.
async function sendMail({ to, subject, html, text }) {
    const t = getTransporter();

    if (!t) {
        if (!warnedNoTransport) {
            console.warn('[mailer] SMTP_HOST not set — emails will be logged instead of sent. Configure SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS in server/.env to send for real.');
            warnedNoTransport = true;
        }
        console.log(`[mailer] would send email\n  to: ${to}\n  subject: ${subject}\n  ${text || html}`);
        return { delivered: false };
    }

    await t.sendMail({
        from: process.env.MAIL_FROM || 'CoWork <no-reply@cowork.local>',
        to,
        subject,
        html,
        text,
    });
    return { delivered: true };
}

function verificationEmail(user, token) {
    const link = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${token}`;
    return {
        to: user.email,
        subject: 'Verify your CoWork email',
        text: `Hi ${user.name}, verify your email: ${link} (expires in 24 hours)`,
        html: `<p>Hi ${user.name},</p><p>Confirm your CoWork account by clicking the link below:</p><p><a href="${link}">${link}</a></p><p>This link expires in 24 hours.</p>`,
    };
}

function passwordResetEmail(user, token) {
    const link = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${token}`;
    return {
        to: user.email,
        subject: 'Reset your CoWork password',
        text: `Hi ${user.name}, reset your password: ${link} (expires in 1 hour). If you didn't request this, ignore this email.`,
        html: `<p>Hi ${user.name},</p><p>Reset your CoWork password by clicking the link below:</p><p><a href="${link}">${link}</a></p><p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>`,
    };
}

module.exports = { sendMail, verificationEmail, passwordResetEmail };
