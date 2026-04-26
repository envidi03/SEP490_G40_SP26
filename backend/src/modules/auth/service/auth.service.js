const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');

const Account = require('../models/account.model');
const AuthProvider = require('../models/auth-provider.model');
const EmailVerification = require('../models/email-verification.model');
const LoginAttempt = require('../models/login-attempt.model');
const PasswordReset = require('../models/password-reset.model');
const Role = require('../models/role.model');
const Session = require('../models/session.model');
const Profile = require('../models/profile.model');
const Patient = require('../../patient/model/patient.model');
require('dotenv').config();
const { signToken, signRefreshToken, verifyToken, hashToken } = require('../../../common/utils/jwt');

const { ValidationError, ConflictError, NotFoundError, UnauthorizedError, ForbiddenError } = require('../../../common/errors');

const emailService = require('../../../common/service/email.service');
const logger = require('../../../common/utils/logger');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const mongoose = require('mongoose');

exports.register = async (data) => {
    const { username, email, password, phone_number, full_name, dob, gender, address, avatar_url } = data;

    if (!username || !email || !password || !full_name) {
        throw new ValidationError('Tên đăng nhập, email, mật khẩu và họ tên là bắt buộc');
    }

    if (username.length < 3) {
        throw new ValidationError('Tên đăng nhập phải có ít nhất 3 ký tự');
    }

    if (username.length > 20) {
        throw new ValidationError('Tên đăng nhập không được vượt quá 20 ký tự');
    }

    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/;
    if (!usernameRegex.test(username)) {
        throw new ValidationError('Tên đăng nhập chỉ được chứa chữ cái, số, dấu gạch dưới và không được bắt đầu bằng số');
    }

    if (password.length < 8) {
        throw new ValidationError('Mật khẩu phải có ít nhất 8 ký tự');
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        throw new ValidationError('Mật khẩu phải chứa ít nhất một chữ hoa, một chữ thường, một số và một ký tự đặc biệt');
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
        throw new NotFoundError('Không tìm thấy quyền mặc định. Vui lòng khởi tạo dữ liệu quyền trước.');
    }

    const hashPassword = await bcryptjs.hash(password, 10);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const [account] = await Account.create([{
            username,
            email,
            password: hashPassword,
            phone_number,
            status: "PENDING",
            role_id: defaultRole._id,
            email_verified: false
        }], { session });

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

        await EmailVerification.create([{
            account_id: account._id,
            token_hash: hashedToken,
            expires_at: new Date(Date.now() + 60 * 60 * 1000)
        }], { session });

        try {
            await emailService.sendEmailVerificationEmail(
                email,
                verificationToken,
                full_name
            );
        } catch (error) {
            console.error('Failed to send verification email:', error); // Giữ nguyên log tiếng Anh
        }

        const [user] = await Profile.create([{
            account_id: account._id,
            full_name,
            dob: dob || null,
            gender: gender || null,
            address: address || null,
            avatar_url: avatar_url || '',
            is_patient: true,
            is_doctor: false
        }], { session });

        const [patient] = await Patient.create([{
            account_id: account._id,
            profile_id: user._id,
            status: "active",
        }], { session });

        await session.commitTransaction();

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
            patient: {
                id: patient._id,
                profile_id: patient.profile_id,
                status: patient.status
            }
        };
    } catch (error) {
        await session.abortTransaction();
        throw error; // Lỗi hệ thống (DB error) ném ra cho global handler bắt
    } finally {
        session.endSession();
    }
};

exports.verifyEmail = async (token) => {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const emailVerification = await EmailVerification.findOne({ token_hash: hashedToken });
    if (!emailVerification) {
        throw new NotFoundError('Không tìm thấy thông tin xác thực email');
    }

    if (emailVerification.expires_at < new Date()) {
        await emailVerification.deleteOne({ _id: emailVerification._id });
        throw new ForbiddenError('Xác thực email đã hết hạn');
    }

    const account = await Account.findById(emailVerification.account_id);
    if (!account) {
        throw new NotFoundError('Không tìm thấy tài khoản');
    }

    account.email_verified = true;
    account.status = 'ACTIVE';
    await account.save();

    await emailVerification.deleteOne({ _id: emailVerification._id });
};

exports.resendVerificationEmail = async (email) => {
    const account = await Account.findOne({ email });
    if (!account) {
        throw new NotFoundError('Không tìm thấy tài khoản');
    }
    if (account.email_verified) {
        throw new ConflictError('Email này đã được xác thực');
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
        console.error('Failed to send verification email:', error); // Giữ nguyên log tiếng Anh
    }
    return {
        message: 'Đã gửi lại email xác thực thành công'
    };
};

exports.login = async (data, ip_address = 'unknown', user_agent = 'unknown') => {
    logger.debug("data", { data: data }); // Giữ nguyên log tiếng Anh
    const { identifier, email, username, password, rememberMe } = data;

    const loginIdentifier = identifier || email || username;

    if (!loginIdentifier || !password) {
        throw new ValidationError('Email/Tên đăng nhập và mật khẩu là bắt buộc', 'AUTH_REQUIRED_FIELDS');
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
    logger.debug("account", { account: account }); // Giữ nguyên log tiếng Anh
    
    if (!account) {
        throw new NotFoundError('Email hoặc mật khẩu không chính xác', 'AUTH_INVALID_CREDENTIALS');
    }

    const recentFailedAttempts = await LoginAttempt.countDocuments({
        account_id: account._id,
        ok: false,
        at: { $gte: new Date(Date.now() - 3 * 60 * 1000) }
    });

    if (recentFailedAttempts >= 5) {
        throw new ForbiddenError('Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau', 'AUTH_TOO_MANY_ATTEMPTS');
    }

    if (account.status === 'INACTIVE') {
        throw new ForbiddenError('Tài khoản đã bị vô hiệu hóa', 'AUTH_ACCOUNT_INACTIVE');
    }

    if (account.status === 'PENDING') {
        throw new ForbiddenError('Vui lòng xác thực email của bạn', 'AUTH_EMAIL_NOT_VERIFIED');
    }

    const isPasswordValid = await bcryptjs.compare(password, account.password);
    if (!isPasswordValid) {
        await LoginAttempt.create({
            account_id: account._id,
            ip: ip_address,
            user_agent,
            ok: false,
            reason: 'Invalid password' // Lý do lưu db giữ nguyên tiếng Anh
        });
        const totalFailed = recentFailedAttempts + 1;
        if (totalFailed >= 5) {
            throw new ForbiddenError(
                'Đăng nhập sai quá nhiều lần. Tài khoản của bạn bị khóa tạm thời trong 3 phút.',
                'AUTH_TOO_MANY_ATTEMPTS'
            );
        }

        const remainingAttempts = 5 - totalFailed;
        throw new UnauthorizedError(
            'Mật khẩu không chính xác',
            'AUTH_INVALID_CREDENTIALS',
            { remainingAttempts }
        );
    }

    const user = await Profile.findOne({ account_id: account._id });
    if (!user) {
        throw new NotFoundError('Không tìm thấy thông tin người dùng');
    }

    const token = signToken({
        account_id: account._id,
        user_id: user._id,
        role: account.role_id.name
    });

    // Remember Me: 30 days if true, 7 days if false
    const refreshTokenExpiry = rememberMe ? 30 : 7;
    const refreshToken = signRefreshToken({
        account_id: account._id,
        user_id: user._id,
        role: account.role_id.name
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
    });

    return {
        account: {
            id: account._id,
            username: account.username,
            email: account.email,
            phone: account.phone_number || '',
            status: account.status,
            email_verified: account.email_verified
        },
        user: {
            id: user._id,
            full_name: user.full_name,
            dob: user.dob,
            gender: user.gender,
            address: user.address || '',
            avatar_url: user.avatar_url || '',
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
        throw new NotFoundError('Không tìm thấy phiên đăng nhập');
    }

    if (session.revoked_at) {
        throw new UnauthorizedError('Phiên đăng nhập đã bị thu hồi');
    }

    await Session.deleteOne({ _id: session._id });

    return {
        message: 'Đăng xuất thành công'
    };
};

exports.refreshToken = async (refreshToken) => {
    const session = await Session.findOne({ refresh_token: hashToken(refreshToken) });
    if (!session) {
        throw new NotFoundError('Không tìm thấy phiên đăng nhập');
    }

    if (session.revoked_at) {
        throw new UnauthorizedError('Phiên đăng nhập đã bị thu hồi');
    }

    if (session.expires_at < new Date()) {
        await session.deleteOne({ _id: session._id });
        throw new ForbiddenError('Phiên đăng nhập đã hết hạn');
    }

    const account = await Account.findById(session.account_id).populate('role_id');
    if (!account) {
        throw new NotFoundError('Không tìm thấy tài khoản');
    }

    if (account.status === 'INACTIVE' || account.status === 'PENDING') {
        throw new ForbiddenError('Tài khoản không hoạt động');
    }

    const user = await Profile.findOne({ account_id: account._id });
    if (!user) {
        throw new NotFoundError('Không tìm thấy thông tin người dùng');
    }

    const newAccessToken = signToken({
        account_id: account._id,
        user_id: user._id,
        role: account.role_id?.name
    });

    return {
        token: newAccessToken,
        accessToken: newAccessToken
    };
};

exports.forgotPassword = async (email) => {
    const account = await Account.findOne({ email });
    logger.info('[AuthService] Forgot password requested for email', { email: email });
    
    if (!account) {
        logger.warn('[AuthService] Forgot password requested for non-existent email', { email: email });
        throw new NotFoundError('Không tìm thấy tài khoản!');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    await PasswordReset.deleteMany({ account_id: account._id });

    await PasswordReset.create({
        account_id: account._id,
        token_hash: hashedOtp,
        expires_at: new Date(Date.now() + 15 * 60 * 1000)
    });

    const user = await Profile.findOne({ account_id: account._id });
    try {
        logger.info('[AuthService] Sending password reset email', { email: email, user: user.full_name });
        await emailService.sendPasswordResetEmail(email, otp, user.full_name);
    } catch (error) {
        logger.error('[AuthService] Error sending password reset email:', { message: error.message });
    }

    return {
        message: 'Đã gửi email khôi phục mật khẩu thành công'
    };
};

exports.resetPassword = async (email, otp, newPassword) => {
    if (!newPassword || newPassword.length < 8) {
        throw new ValidationError('Vui lòng nhập mật khẩu mới có ít nhất 8 ký tự!');
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
        throw new ValidationError('Mật khẩu phải có ít nhất 8 ký tự, bao gồm ít nhất một chữ hoa, một chữ thường, một số và một ký tự đặc biệt!');
    }

    const account = await Account.findOne({ email });
    if (!account) {
        throw new NotFoundError('Không tìm thấy tài khoản!');
    }

    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    const passwordReset = await PasswordReset.findOne({
        account_id: account._id,
        token_hash: hashedOtp,
        used: false
    });

    if (!passwordReset) {
        throw new UnauthorizedError('Mã OTP không hợp lệ');
    }

    if (passwordReset.expires_at < new Date()) {
        await PasswordReset.deleteOne({ _id: passwordReset._id });
        throw new UnauthorizedError('Mã OTP đã hết hạn');
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    account.password = hashedPassword;
    await account.save();

    passwordReset.used = true;
    await passwordReset.save();

    await PasswordReset.deleteOne({ _id: passwordReset._id });
    await Session.deleteMany({ account_id: account._id });

    return {
        message: 'Đặt lại mật khẩu thành công'
    };
};

exports.changePassword = async (account_id, currentPassword, newPassword) => {
    if (!newPassword || newPassword.length < 8) {
        throw new ValidationError('Vui lòng nhập mật khẩu mới có ít nhất 8 ký tự!');
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(newPassword)) {
        throw new ValidationError('Mật khẩu phải có ít nhất 8 ký tự, bao gồm ít nhất một chữ hoa, một chữ thường, một số và một ký tự đặc biệt!');
    }

    const account = await Account.findById(account_id).select('+password');
    if (!account) {
        throw new NotFoundError('Không tìm thấy tài khoản!');
    }

    const isPasswordValid = await bcryptjs.compare(currentPassword, account.password);
    if (!isPasswordValid) {
        throw new UnauthorizedError('Mật khẩu cũ không chính xác!');
    }

    const isSamePassword = await bcryptjs.compare(newPassword, account.password);
    if (isSamePassword) {
        throw new UnauthorizedError('Mật khẩu mới không được trùng với mật khẩu cũ!');
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    account.password = hashedPassword;
    await account.save();

    await Session.deleteMany({ account_id: account._id });

    return {
        message: 'Đổi mật khẩu thành công'
    };
};

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
        throw new UnauthorizedError(`Token Google không hợp lệ: ${error.message}`);
    }

    const { sub: googleId, email, name, picture } = payload;

    let account;
    const existingGoogleProvider = await AuthProvider.findOne({
        provider: 'google',
        provider_user_id: googleId
    });

    if (existingGoogleProvider) {
        account = await Account.findById(existingGoogleProvider.account_id).populate({
            path: "role_id",
            populate: {
                path: "permissions"
            }
        });

        if (!account) {
            await AuthProvider.deleteOne({ _id: existingGoogleProvider._id });
            logger.warn('Deleted orphaned Google AuthProvider record', { googleId });
        } else if (account.status === 'INACTIVE') {
            throw new ForbiddenError('Tài khoản đã bị vô hiệu hóa');
        }
    }

    if (!account) {
        account = await Account.findOne({ email }).populate({
            path: "role_id",
            populate: {
                path: "permissions"
            }
        });

        if (!account) {
            const defaultRole = await Role.findOne({ name: 'PATIENT' });
            if (!defaultRole) {
                throw new NotFoundError('Không tìm thấy quyền mặc định');
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

            const profile = await Profile.create({
                account_id: account._id,
                full_name: name || '',
                avatar_url: picture || undefined
            });

            await Patient.create({
                account_id: account._id,
                profile_id: profile._id,
                status: "active",
            });

            await AuthProvider.create({
                account_id: account._id,
                provider: 'google',
                provider_user_id: googleId,
                email: email
            });

            const setupToken = crypto.randomBytes(32).toString('hex');
            const hashedToken = crypto.createHash('sha256').update(setupToken).digest('hex');

            await PasswordReset.create({
                account_id: account._id,
                token_hash: hashedToken,
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) 
            });

            try {
                await emailService.sendWelcomeGoogleAuthEmail(email, setupToken, name);
            } catch (error) {
                logger.error('Failed to send welcome email:', error);
            }

            account = await Account.findById(account._id).populate({
                path: 'role_id',
                populate: {
                    path: 'permissions'
                }
            });
        } else {
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
                throw new ForbiddenError('Tài khoản đã bị vô hiệu hóa');
            }
        }
    }

    const user = await Profile.findOne({ account_id: account._id });

    if (account.role_id.name === 'PATIENT') {
        const existingPatient = await Patient.findOne({ account_id: account._id });
        if (!existingPatient) {
            await Patient.create({
                account_id: account._id,
                profile_id: user._id,
                status: "active",
            });
            logger.info("Auto-created missing Patient record for Google account", {
                account_id: account._id
            });
        }
    }

    const token = signToken({
        account_id: account._id,
        user_id: user._id,
        role: account.role_id.name
    });

    const refreshTokenExpiry = 7;
    const refreshToken = signRefreshToken({
        account_id: account._id,
        user_id: user._id,
        role: account.role_id.name
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
            phone: account.phone_number || '',
            status: account.status,
            email_verified: account.email_verified
        },
        user: {
            id: user._id,
            full_name: user.full_name,
            dob: user.dob || null,
            gender: user.gender || '',
            address: user.address || '',
            avatar_url: user.avatar_url || '',
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

exports.setupPasswordService = async (email, token, newPassword) => {
    if (!newPassword || newPassword.length < 8) {
        throw new ValidationError('Mật khẩu phải có ít nhất 8 ký tự!');
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
        throw new ValidationError('Mật khẩu phải chứa ít nhất một chữ hoa, một chữ thường, một số và một ký tự đặc biệt!');
    }

    const account = await Account.findOne({ email });
    if (!account) {
        throw new NotFoundError('Không tìm thấy tài khoản!');
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const setupTokenDoc = await PasswordReset.findOne({
        account_id: account._id,
        token_hash: hashedToken,
        used: false
    });

    if (!setupTokenDoc) {
        throw new UnauthorizedError('Mã thiết lập không hợp lệ hoặc đã được sử dụng!');
    }

    if (setupTokenDoc.expires_at < new Date()) {
        await PasswordReset.deleteOne({ _id: setupTokenDoc._id });
        throw new UnauthorizedError('Mã thiết lập đã hết hạn!');
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    account.password = hashedPassword;
    await account.save();

    await PasswordReset.deleteOne({ _id: setupTokenDoc._id });

    await Session.deleteMany({ account_id: account._id });

    return {
        message: 'Thiết lập mật khẩu thành công! Bây giờ bạn có thể đăng nhập bằng email và mật khẩu mới.'
    };
};