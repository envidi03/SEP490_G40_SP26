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

const { ValidationError, ConflictError, NotFoundError, UnauthorizedError, ForbiddenError } = require('../common/errors');

exports.register = async (data) => {
    const { username, email, password, phone_number, full_name, dob, gender, address, avatar_url } = data;

    if (!username || !email || !password || !full_name) {
        throw new ValidationError('Username, email, password and full_name are required');
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
        status: "ACTIVE",
        role_id: defaultRole._id,
        email_verified: false
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

    account.user_id = user._id;
    await account.save();

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

    const isPasswordValid = await bcryptjs.compare(password, account.password);
    if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid password');
    }

    const user = await User.findOne({ account_id: account._id });
    if (!user) {
        throw new NotFoundError('User not found');
    }

    const token = jwt.sign({
        account_id: account._id,
        user_id: user._id
    }, process.env.JWT_SECRET, { expiresIn: '1h' });

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
