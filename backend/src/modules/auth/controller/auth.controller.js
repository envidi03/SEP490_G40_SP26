const logger = require('../../../common/utils/logger');
const authService = require('../service/auth.service');

exports.register = async (req, res, next) => {
    try {
        const result = await authService.register(req.body);
        res.status(201).json({
            status: 'success',
            message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản của bạn.',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const ip_address = req.ip ||
            req.headers['x-forwarded-for']?.split(',')[0].trim() ||
            req.connection.remoteAddress ||
            'unknown';
        const user_agent = req.headers['user-agent'] || 'unknown';

        const result = await authService.login(req.body, ip_address, user_agent);
        res.status(200).json({
            status: 'success',
            message: 'Đăng nhập thành công',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

exports.verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.query;
        if (!token) {
            return res.status(400).json({
                status: 'error',
                message: 'Mã xác thực email là bắt buộc'
            });
        }

        await authService.verifyEmail(token);
        res.status(200).json({
            status: 'success',
            message: 'Xác thực email thành công. Bạn có thể đăng nhập ngay bây giờ.'
        });
    } catch (error) {
        next(error);
    }
};

exports.resendVerificationEmail = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                status: 'error',
                message: 'Email không được để trống'
            });
        }

        const result = await authService.resendVerificationEmail(email);
        res.status(200).json({
            status: 'success',
            message: 'Yêu cầu gửi lại email xác thực thành công'
        });
    } catch (error) {
        next(error);
    }
};

exports.logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({
                status: 'error',
                message: 'Refresh token là bắt buộc'
            });
        }

        await authService.logout(refreshToken);
        res.status(200).json({
            status: 'success',
            message: 'Đăng xuất thành công'
        });
    } catch (error) {
        next(error);
    }
};

exports.refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({
                status: 'error',
                message: 'Refresh token là bắt buộc'
            });
        }

        const result = await authService.refreshToken(refreshToken);
        res.status(200).json({
            status: 'success',
            message: 'Làm mới mã truy cập thành công',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        logger.info('[AuthController] Forgot password request received', { email: email });
        if (!email) {
            logger.warn('[AuthController] Forgot password request missing email');
            return res.status(400).json({
                status: 'error',
                message: 'Email không được để trống'
            });
        }

        const result = await authService.forgotPassword(email);
        res.status(200).json({
            status: 'success',
            message: 'Yêu cầu đặt lại mật khẩu đã được gửi đến email của bạn'
        });
    } catch (error) {
        logger.error('[AuthController] Error in forgotPassword:', { message: error.message });
        next(error);
    }
};

exports.resetPassword = async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                status: 'error',
                message: 'Email, mã OTP và mật khẩu mới là bắt buộc'
            });
        }

        const result = await authService.resetPassword(email, otp, newPassword);
        res.status(200).json({
            status: 'success',
            message: 'Đặt lại mật khẩu thành công'
        });
    } catch (error) {
        next(error);
    }
};

exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                status: 'error',
                message: 'Mật khẩu hiện tại và mật khẩu mới là bắt buộc'
            });
        }

        const result = await authService.changePassword(req.user.account_id, currentPassword, newPassword);
        res.status(200).json({
            status: 'success',
            message: 'Thay đổi mật khẩu thành công'
        });
    } catch (error) {
        next(error);
    }
};

exports.googleAuth = async (req, res, next) => {
    try {
        const { googleToken } = req.body;
        if (!googleToken) {
            return res.status(400).json({
                status: 'error',
                message: 'Google token là bắt buộc'
            });
        }

        const ip_address = req.ip ||
            req.headers['x-forwarded-for']?.split(',')[0].trim() ||
            req.connection.remoteAddress ||
            'unknown';
        const user_agent = req.headers['user-agent'] || 'unknown';

        const result = await authService.googleAuth(googleToken, ip_address, user_agent);
        res.status(200).json({
            status: 'success',
            message: 'Đăng nhập bằng Google thành công',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

exports.setupPassword = async (req, res, next) => {
    try {
        const { email, token, newPassword } = req.body;
        if (!email || !token || !newPassword) {
            return res.status(400).json({
                status: 'error',
                message: 'Email, mã xác thực và mật khẩu mới là bắt buộc'
            });
        }

        const result = await authService.setupPasswordService(email, token, newPassword);
        res.status(200).json({
            status: 'success',
            message: 'Thiết lập mật khẩu thành công'
        });
    } catch (error) {
        next(error);
    }
};