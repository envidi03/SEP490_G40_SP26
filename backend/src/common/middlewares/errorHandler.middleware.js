const { BaseError } = require('../errors');
const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
    console.error('Error:', err);

    if (err.name === 'ValidationError' && err.errors) {
        return res.status(400).json({
            success: false,
            message: 'Dữ liệu không hợp lệ',
            errors: Object.values(err.errors).map(e => ({
                field: e.path,
                message: e.message
            }))
        });
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(409).json({
            success: false,
            message: `${field} đã tồn tại`
        });
    }

    if (err.isOperational) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors
        });
    }

    logger.error('Unhandled error caught by global error handler', {
        context: 'GlobalErrorHandler',
        message: err.message,
        stack: err.stack,
    });

    res.status(500).json({
        success: false,
        message: 'Hệ thống lỗi, vui lòng thực hiện sau'
    });
}

module.exports = errorHandler;
