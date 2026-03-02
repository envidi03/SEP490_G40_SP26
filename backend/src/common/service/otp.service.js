const crypto = require('crypto');
const emailService = require('./email.service');
const EmailVerification = require('../../modules/auth/models/email-verification.model');
const PasswordReset = require('../../modules/auth/models/password-reset.model');
require('dotenv').config();

class OTPService {
    generateOTP() {
        return crypto.randomInt(100000, 999999).toString();
    }

    hashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }

    getExpiryTime() {
        const minutes = parseInt(process.env.OTP_EXPIRES_MINUTES || '15');
        return new Date(Date.now() + minutes * 60 * 1000);
    }

    async sendEmailVerification(accountId, email, userName = '') {
        const recentVerifications = await this.getRecentOTPCount(accountId, 'email_verification', 15);
        if (recentVerifications >= 3) {
            throw new Error('Too many verification requests. Please try again later');
        }

        const otp = this.generateOTP();
        const tokenHash = this.hashToken(otp);
        const expiresAt = this.getExpiryTime();

        await EmailVerification.create({
            account_id: accountId,
            token_hash: tokenHash,
            expires_at: expiresAt,
            used: false
        });

        await emailService.sendEmailVerificationEmail(email, otp, userName);
    }


    async verifyEmailOTP(accountId, otp) {
        const tokenHash = this.hashToken(otp);

        const verification = await EmailVerification.findOne({
            account_id: accountId,
            token_hash: tokenHash,
            used: false,
            expires_at: { $gt: new Date() }
        });

        if (!verification) {
            throw new Error('Invalid or expired OTP');
        }

        verification.used = true;
        await verification.save();

        return true;
    }

    async sendPasswordResetOTP(accountId, email, userName = '') {
        const recentResets = await this.getRecentPasswordResetCount(accountId, 15);
        if (recentResets >= 3) {
            throw new Error('Too many password reset requests. Please try again later');
        }

        const otp = this.generateOTP();
        const tokenHash = this.hashToken(otp);
        const expiresAt = this.getExpiryTime();

        await PasswordReset.create({
            account_id: accountId,
            token_hash: tokenHash,
            expires_at: expiresAt,
            used: false
        });

        await emailService.sendPasswordResetEmail(email, otp, userName);
    }

    async verifyPasswordResetOTP(accountId, otp) {
        const tokenHash = this.hashToken(otp);

        const reset = await PasswordReset.findOne({
            account_id: accountId,
            token_hash: tokenHash,
            used: false,
            expires_at: { $gt: new Date() }
        });

        if (!reset) {
            throw new Error('Invalid or expired OTP');
        }

        reset.used = true;
        await reset.save();

        return true;
    }

    async getRecentOTPCount(accountId, verificationType, minutes = 15) {
        const since = new Date(Date.now() - minutes * 60 * 1000);

        return EmailVerification.countDocuments({
            account_id: accountId,
            createdAt: { $gte: since }
        });
    }

    async getRecentPasswordResetCount(accountId, minutes = 15) {
        const since = new Date(Date.now() - minutes * 60 * 1000);

        return PasswordReset.countDocuments({
            account_id: accountId,
            createdAt: { $gte: since }
        });
    }

    async cleanupExpiredOTPs() {
        const now = new Date();

        await EmailVerification.deleteMany({
            expires_at: { $lt: now }
        });

        await PasswordReset.deleteMany({
            expires_at: { $lt: now }
        });
    }
}

module.exports = new OTPService();
