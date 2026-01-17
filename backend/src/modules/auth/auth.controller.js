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
        const result = await authService.login(req.body);
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