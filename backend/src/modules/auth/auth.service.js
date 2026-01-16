const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Account = require('../auth/models/Account.model');
const AuthProvider = require('../auth/models/AuthProviders.model');
const EmailVerification = require('../auth/models/EmailVerification.model');
const LoginAttempt = require('../auth/models/LoginAttempt.model');
const PasswordReset = require('../auth/models/PasswordReset.model');
const Permission = require('../auth/models/Permission.model');
const Role = require('../auth/models/Role.model');
const Session = require('../auth/models/Session.model');
const User = require('../auth/models/User.model');
require('dotenv').config();
const { signToken, signRefreshToken, verifyRefreshToken, revokeRefreshToken, verifyToken, hashToken } = require('../common/utils/jwt');

const { ValidationError, ConflictError, NotFoundError, UnauthorizedError, ForbiddenError } = require('../common/errors');

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
        status: "Pending",
        role_id: defaultRole._id,
        email_verified: false
    });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

    await EmailVerification.create({
        account_id: account._id,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000)
    });

    const user = await User.create({
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

exports.login = async (data) => {
    const { email, password } = data;

    if (!email || !password) {
        throw new ValidationError('Email and password are required');
    }

    const account = await Account.findOne({ email });
    if (!account) {
        throw new NotFoundError('Account not found');
    }


    if (account.status === 'INACTIVE') {
        throw new ForbiddenError('Account is inactive');
    }

    if (account.status === 'PENDING') {
        throw new ForbiddenError('Please verify your email');
    }

    const isPasswordValid = await bcryptjs.compare(password, account.password);
    if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid password');
    }

    const user = await User.findOne({ account_id: account._id });
    if (!user) {
        throw new NotFoundError('User not found');
    }

    const token = signToken({
        account_id: account._id,
        user_id: user._id
    });
    const refreshToken = signRefreshToken({
        account_id: account._id,
        user_id: user._id
    });

    const hashedRefreshToken = hashToken(refreshToken);

    const session = await Session.create({
        account_id: account._id,
        user_id: user._id,
        refresh_token: hashedRefreshToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
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
        },
        token,
        refreshToken
    };
};


exports.refreshToken = async (refreshToken) => {
    const session = await Session.findOne({ refresh_token: hashToken(refreshToken) });
    if (!session) {
        throw new NotFoundError('Session not found');
    }

    if (session.expires_at < new Date()) {
        throw new ForbiddenError('Session expired');
    }

    const account = await Account.findById(session.account_id);
    if (!account) {
        throw new NotFoundError('Account not found');
    }

    if (account.status === 'INACTIVE' || account.status === 'PENDING') {
        throw new ForbiddenError('Account is not active');
    }

    const user = await User.findById(session.user_id);
    if (!user) {
        throw new NotFoundError('User not found');
    }

    const token = signToken({
        account_id: account._id,
        user_id: user._id
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
        },
        token
    };
};
