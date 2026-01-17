const authService = require('./auth.service');

exports.register = async (req, res, next) => {
    try {
        const data = req.body;
        const result = await authService.register(data);
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: result
        })
    } catch (error) {
        next(error);
    }
} 
