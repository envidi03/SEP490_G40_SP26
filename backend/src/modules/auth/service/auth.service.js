const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');

const Account = require('../models/account.model');
const AuthProvider = require('../models/auth-provider.model');
const EmailVerification = require('../models/email-verification.model');
const LoginAttempt = require('../models/login-attempt.model');
const PasswordReset = require('../models/password-reset.model');
const Permission = require('../models/permission.model');
const Role = require('../models/role.model');
const Session = require('../models/session.model');
const Profile = require('../models/profile.model');
require('dotenv').config();
const { signToken, signRefreshToken, verifyToken, hashToken } = require('../../../common/utils/jwt');

const { ValidationError, ConflictError, NotFoundError, UnauthorizedError, ForbiddenError } = require('../../../common/errors');

const emailService = require('../../../common/service/email.service');
const logger = require('../../../common/utils/logger');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.register = async (data) => {
    const { username, email, password, phone_number, full_name, dob, gender, address, avatar_url } = data;

    if (!username || !email || !password || !full_name) {
        throw new ValidationError('Username, email, password and full_name are required');
    }


    if (password.length < 8) {
        throw new ValidationError('Password must be at least 8 characters long');
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        throw new ValidationError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    }

    const existingEmail = await Account.findOne({ email });
    if (existingEmail) {
        throw new ConflictError('Email đã được sử dụng');
    }

    const existingUsername = await Account.findOne({ username });
    if (existingUsername) {
        throw new ConflictError('Username đã được sử dụng');
    }

    if (phone_number) {
        const existingPhone = await Account.findOne({ phone_number });
        if (existingPhone) {
            throw new ConflictError('Số điện thoại đã được sử dụng');
        }
    }

    const defaultRole = await Role.findOne({ name: 'PATIENT' });
    if (!defaultRole) {
        throw new NotFoundError('Default role not found. Please seed roles first.');
    }

    const hashPassword = await bcryptjs.hash(password, 10);

    const account = await Account.create({
        username,
        email,
        password: hashPassword,
        phone_number,
        status: "PENDING",
        role_id: defaultRole._id,
        email_verified: false
    });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

    await EmailVerification.create({
        account_id: account._id,
        token_hash: hashedToken,
        expires_at: new Date(Date.now() + 60 * 60 * 1000)
    });

    try {
        await emailService.sendEmailVerificationEmail(
            email,
            verificationToken,
            full_name
        );
    } catch (error) {
        console.error('Failed to send verification email:', error);
    }

    const user = await Profile.create({
        account_id: account._id,
        full_name,
        dob: dob || null,
        gender: gender || null,
        address: address || null,
        avatar_url: avatar_url || '',
        is_patient: true,
        is_doctor: false
    });

    return {
        account: {
            id: account._id,
            username: account.username,
            email: account.email,
            status: account.status,
            email_verified: account.email_verified
        },
        user: {
            id: user._id,
            full_name: user.full_name,
            dob: user.dob,
            gender: user.gender
        }
    };
};

exports.verifyEmail = async (token) => {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const emailVerification = await EmailVerification.findOne({ token_hash: hashedToken });
    if (!emailVerification) {
        throw new NotFoundError('Email verification not found');
    }

    if (emailVerification.expires_at < new Date()) {
        await emailVerification.deleteOne({ _id: emailVerification._id });
        throw new ForbiddenError('Email verification expired');
    }

    const account = await Account.findById(emailVerification.account_id);
    if (!account) {
        throw new NotFoundError('Account not found');
    }

    account.email_verified = true;
    account.status = 'ACTIVE';
    await account.save();

    await emailVerification.deleteOne({ _id: emailVerification._id });
};

exports.resendVerificationEmail = async (email) => {
    const account = await Account.findOne({ email });
    if (!account) {
        throw new NotFoundError('Account not found');
    }
    if (account.email_verified) {
        throw new ConflictError('Email already verified');
    }

    await EmailVerification.deleteMany({ account_id: account._id });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

    await EmailVerification.create({
        account_id: account._id,
        token_hash: hashedToken,
        expires_at: new Date(Date.now() + 60 * 60 * 1000)
    });

    const user = await Profile.findOne({ account_id: account._id });

    try {
        await emailService.sendEmailVerificationEmail(
            email,
            verificationToken,
            user?.full_name || ''
        );
    } catch (error) {
        console.error('Failed to send verification email:', error);
    }
    return {
        message: 'Verification email sent successfully'
    };
};

exports.login = async (data, ip_address = 'unknown', user_agent = 'unknown') => {
    logger.debug("data", {
        data: data
    })
    const { identifier, email, username, password, rememberMe } = data;

    const loginIdentifier = identifier || email || username;

    if (!loginIdentifier || !password) {
        throw new ValidationError('Email/Username and password are required');
    }

    const account = await Account.findOne({
        $or: [
            { email: loginIdentifier },
            { username: loginIdentifier }
        ]
    })
        .select('+password')
        .populate({
            path: 'role_id',
            populate: {
                path: 'permissions'
            }
        });
    logger.debug("account", {
        account: account
    })
    if (!account) {
        throw new NotFoundError('Email or password is incorrect');
    }

    const recentFailedAttempts = await LoginAttempt.countDocuments({
        account_id: account._id,
        ok: false,
        at: { $gte: new Date(Date.now() - 3 * 60 * 1000) }
    })

    if (recentFailedAttempts >= 5) {
        throw new ForbiddenError('Too many failed attempts. Please try again later');
    }

    if (account.status === 'INACTIVE') {
        throw new ForbiddenError('Account is inactive');
    }

    if (account.status === 'PENDING') {
        throw new ForbiddenError('Please verify your email');
    }

    const isPasswordValid = await bcryptjs.compare(password, account.password);
    if (!isPasswordValid) {
        await LoginAttempt.create({
            account_id: account._id,
            ip: ip_address,
            user_agent,
            ok: false,
            reason: 'Invalid password'
        })
        throw new UnauthorizedError('Invalid password');
    }

    const user = await Profile.findOne({ account_id: account._id });
    if (!user) {
        throw new NotFoundError('User not found');
    }

    const token = signToken({
        account_id: account._id,
        user_id: user._id
    });

    // Remember Me: 30 days if true, 7 days if false
    const refreshTokenExpiry = rememberMe ? 30 : 7;
    const refreshToken = signRefreshToken({
        account_id: account._id,
        user_id: user._id
    }, refreshTokenExpiry);

    const hashedRefreshToken = hashToken(refreshToken);

    const session = await Session.create({
        account_id: account._id,
        refresh_token: hashedRefreshToken,
        ip_address,
        user_agent,
        remember_me: rememberMe || false,
        expires_at: new Date(Date.now() + refreshTokenExpiry * 24 * 60 * 60 * 1000)
    });

    await LoginAttempt.create({
        account_id: account._id,
        ip: ip_address,
        user_agent,
        ok: true
    })

    return {
        account: {
            id: account._id,
            username: account.username,
            email: account.email,
            status: account.status,
            email_verified: account.email_verified
        },
        user: {
            id: user._id,
            full_name: user.full_name,
            dob: user.dob,
            gender: user.gender,
            is_doctor: user.is_doctor,
            is_patient: user.is_patient
        },
        role: {
            id: account.role_id._id,
            name: account.role_id.name,
            permissions: account.role_id.permissions.map(p => ({
                code: p.code,
                name: p.name,
                module: p.module
            }))
        },
        token,
        refreshToken
    };
};

exports.logout = async (refreshToken) => {
    const hashedRefreshToken = hashToken(refreshToken);
    const session = await Session.findOne({ refresh_token: hashedRefreshToken });

    if (!session) {
        throw new NotFoundError('Session not found');
    }

    if (session.revoked_at) {
        throw new UnauthorizedError('Session already revoked');
    }

    await Session.deleteOne({ _id: session._id });

    return {
        message: 'Logged out successfully'
    };
};


exports.refreshToken = async (refreshToken) => {
    const session = await Session.findOne({ refresh_token: hashToken(refreshToken) });
    if (!session) {
        throw new NotFoundError('Session not found');
    }

    if (session.revoked_at) {
        throw new UnauthorizedError('Session already revoked');
    }

    if (session.expires_at < new Date()) {
        await session.deleteOne({ _id: session._id });
        throw new ForbiddenError('Session expired');
    }

    const account = await Account.findById(session.account_id);
    if (!account) {
        throw new NotFoundError('Account not found');
    }

    if (account.status === 'INACTIVE' || account.status === 'PENDING') {
        throw new ForbiddenError('Account is not active');
    }

    const user = await Profile.findById(session.user_id);
    if (!user) {
        throw new NotFoundError('User not found');
    }

    const newAccessToken = signToken({
        account_id: account._id,
        user_id: user._id
    });

    return {
        token: newAccessToken
    };
};

exports.forgotPassword = async (email) => {
    const account = await Account.findOne({ email });
    if (!account) {
        throw new NotFoundError('Account not found!')
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    await PasswordReset.deleteMany({ account_id: account._id });

    await PasswordReset.create({
        account_id: account._id,
        token_hash: hashedOtp,
        expires_at: new Date(Date.now() + 15 * 60 * 1000)
    })

    const user = await Profile.findOne({ account_id: account._id })
    try {
        await emailService.sendPasswordResetEmail(email, otp, user.full_name);
    } catch (error) {
        console.error('Failed to send email:', error);
    }

    return {
        message: 'Password reset email sent successfully'
    }
}

exports.resetPassword = async (email, otp, newPassword) => {
    if (!newPassword || newPassword.length < 8) {
        throw new ValidationError('New password is required!');
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
        throw new ValidationError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character!');
    }

    const account = await Account.findOne({ email });
    if (!account) {
        throw new NotFoundError('Account not found!');
    }

    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    const passwordReset = await PasswordReset.findOne({
        account_id: account._id,
        token_hash: hashedOtp,
        used: false
    })

    if (!passwordReset) {
        throw new UnauthorizedError('Invalid OTP')
    }

    if (passwordReset.expires_at < new Date()) {
        await PasswordReset.deleteOne({ _id: passwordReset._id })
        throw new UnauthorizedError('OTP is expired')
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    account.password = hashedPassword;
    await account.save();

    passwordReset.used = true;
    await passwordReset.save();

    await PasswordReset.deleteOne({ _id: passwordReset._id })

    await Session.deleteMany({ account_id: account._id })

    return {
        message: 'Password reset successfully'
    }
}

exports.changePassword = async (account_id, currentPassword, newPassword) => {
    if (!newPassword || newPassword.length < 8) {
        throw new ValidationError('New password is required!')
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(newPassword)) {
        throw new ValidationError('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character!')
    }

    const account = await Account.findById(account_id).select('+password')
    if (!account) {
        throw new NotFoundError('Account not found!')
    }

    const isPasswordValid = await bcryptjs.compare(currentPassword, account.password)
    if (!isPasswordValid) {
        throw new UnauthorizedError('Old password is incorrect!')
    }

    const isSamePassword = await bcryptjs.compare(newPassword, account.password)
    if (isSamePassword) {
        throw new UnauthorizedError('New password is same as old password!')
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10)
    account.password = hashedPassword
    await account.save();

    await Session.deleteMany({ account_id: account._id })

    return {
        message: 'Password changed successfully'
    }
}

exports.googleAuth = async (googleToken, ip_address = 'unknown', user_agent = 'unknown') => {
    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    let payload;
    try {
        const ticket = await client.verifyIdToken({
            idToken: googleToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        payload = ticket.getPayload();
    } catch (error) {
        console.error('Google token verification failed:', error.message);
        console.error('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
        console.error('Token received (first 50 chars):', googleToken?.substring(0, 50));
        throw new UnauthorizedError(`Invalid Google token: ${error.message}`);
    }

    const { sub: googleId, email, name, picture } = payload;

    // Check if this Google ID is already linked to another account
    const existingGoogleProvider = await AuthProvider.findOne({
        provider: 'google',
        provider_user_id: googleId
    });

    if (existingGoogleProvider) {
        // Google ID already exists, use that account
        account = await Account.findById(existingGoogleProvider.account_id).populate({
            path: "role_id",
            populate: {
                path: "permissions"
            }
        });

        if (!account) {
            throw new NotFoundError('Account linked to this Google account not found');
        }

        if (account.status === 'INACTIVE') {
            throw new ForbiddenError('Account is inactive');
        }
    } else {
        // Google ID doesn't exist, check if email exists
        account = await Account.findOne({ email }).populate({
            path: "role_id",
            populate: {
                path: "permissions"
            }
        });

        if (!account) {
            // Create new account
            const defaultRole = await Role.findOne({ name: 'PATIENT' });
            if (!defaultRole) {
                throw new NotFoundError('Default role not found');
            }

            const randomPassword = crypto.randomBytes(32).toString('hex');
            const hashedPassword = await bcryptjs.hash(randomPassword, 10);

            account = await Account.create({
                username: `user_${Date.now()}`,
                email,
                password: hashedPassword,
                status: 'ACTIVE',
                role_id: defaultRole._id,
                email_verified: true
            });

            await Profile.create({
                account_id: account._id,
                full_name: name || '',
                avatar_url: picture || undefined
            });

            await AuthProvider.create({
                account_id: account._id,
                provider: 'google',
                provider_user_id: googleId,
                email: email
            });

            account = await Account.findById(account._id).populate({
                path: 'role_id',
                populate: {
                    path: 'permissions'
                }
            });
        } else {
            // Account exists, link Google provider if not already linked
            const existingProvider = await AuthProvider.findOne({
                account_id: account._id,
                provider: 'google'
            });

            if (!existingProvider) {
                await AuthProvider.create({
                    account_id: account._id,
                    provider: 'google',
                    provider_user_id: googleId,
                    email: email
                });
            }

            if (account.status === 'INACTIVE') {
                throw new ForbiddenError('Account is inactive');
            }
        }
    }

    const user = await Profile.findOne({ account_id: account._id });

    const token = signToken({
        account_id: account._id,
        user_id: user._id
    });

    const refreshTokenExpiry = 7;
    const refreshToken = signRefreshToken({
        account_id: account._id,
        user_id: user._id
    }, refreshTokenExpiry);

    const hashedRefreshToken = hashToken(refreshToken);
    await Session.create({
        account_id: account._id,
        refresh_token: hashedRefreshToken,
        ip_address,
        user_agent,
        remember_me: false,
        expires_at: new Date(Date.now() + refreshTokenExpiry * 24 * 60 * 60 * 1000)
    });

    await LoginAttempt.create({
        account_id: account._id,
        ip: ip_address,
        user_agent,
        ok: true
    });

    return {
        account: {
            id: account._id,
            username: account.username,
            email: account.email,
            status: account.status,
            email_verified: account.email_verified
        },
        user: {
            id: user._id,
            full_name: user.full_name,
            avatar_url: user.avatar_url
        },
        role: {
            id: account.role_id._id,
            name: account.role_id.name,
            permissions: account.role_id.permissions.map(p => ({
                code: p.code,
                name: p.name,
                module: p.module
            }))
        },
        token,
        refreshToken
    };
};

