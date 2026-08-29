const { Resend } = require('resend');

const SEND_TIMEOUT_MS = 10000;

let resendClient = null;
let warnedNoApiKey = false;

// Lazy — built on first send so a missing API key doesn't crash the app at
// require-time, only the send itself degrades (see sendMail below).
function getClient() {
    if (resendClient) return resendClient;
    if (!process.env.RESEND_API_KEY) return null;

    resendClient = new Resend(process.env.RESEND_API_KEY);
    return resendClient;
}

// Resend's SDK has no built-in cancellation, and a hung request (bad network
// path, provider outage) must not hang the calling request forever — race it
// against a timeout so sendMail always settles.
function withTimeout(promise, ms) {
    let timer;
    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`Resend request timed out after ${ms}ms`)), ms);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// Sends an email via Resend (HTTPS, not SMTP — avoids hosts that block/hang
// outbound SMTP ports) if RESEND_API_KEY is configured; otherwise logs to the
// console so auth flows (register/forgot-password) still work end to end in
// local dev before a real API key is added to .env.
async function sendMail({ to, subject, html, text }) {
    const client = getClient();

    if (!client) {
        if (!warnedNoApiKey) {
            console.warn('[mailer] RESEND_API_KEY not set — emails will be logged instead of sent. Set RESEND_API_KEY in server/.env to send for real.');
            warnedNoApiKey = true;
        }
        console.log(`[mailer] would send email\n  to: ${to}\n  subject: ${subject}\n  ${text || html}`);
        return { delivered: false };
    }

    const { error } = await withTimeout(
        client.emails.send({
            from: process.env.MAIL_FROM || 'CoWork <no-reply@cowork.local>',
            to,
            subject,
            html,
            text,
        }),
        SEND_TIMEOUT_MS
    );

    if (error) {
        throw new Error(error.message || 'Resend API error');
    }

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
