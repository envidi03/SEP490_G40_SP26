const authService = require('./auth.service');

exports.register = async (req, res, next) => {
    try {
        const result = await authService.register(req.body);
        res.status(201).json({
            status: 'success',
            message: 'Registration successful. Please check your email to verify your account.',
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
            message: 'Login successful',
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
                message: 'Verification token is required'
            });
        }

        await authService.verifyEmail(token);
        res.status(200).json({
            status: 'success',
            message: 'Email verified successfully. You can now login.'
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
                message: 'Email is required'
            });
        }

        const result = await authService.resendVerificationEmail(email);
        res.status(200).json({
            status: 'success',
            message: result.message
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
                message: 'Refresh token is required'
            });
        }

        await authService.logout(refreshToken);
        res.status(200).json({
            status: 'success',
            message: 'Logged out successfully'
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
                message: 'Refresh token is required'
            });
        }

        const result = await authService.refreshToken(refreshToken);
        res.status(200).json({
            status: 'success',
            message: 'Token refreshed successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                status: 'error',
                message: 'Email is required'
            });
        }

        const result = await authService.forgotPassword(email);
        res.status(200).json({
            status: 'success',
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

exports.resetPassword = async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                status: 'error',
                message: 'Email, OTP, and new password are required'
            });
        }

        const result = await authService.resetPassword(email, otp, newPassword);
        res.status(200).json({
            status: 'success',
            message: result.message
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
                message: 'Current password and new password are required'
            });
        }

        const result = await authService.changePassword(req.user.account_id, currentPassword, newPassword);
        res.status(200).json({
            status: 'success',
            message: result.message
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
                message: 'Google token is required'
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
            message: 'Google login successful',
            data: result
        });
    } catch (error) {
        next(error);
    }
};