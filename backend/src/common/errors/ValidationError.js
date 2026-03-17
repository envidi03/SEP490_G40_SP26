const BaseError = require('./BaseError');

class ValidationError extends BaseError {
    constructor(message = 'Validation failed', errorCode = 'VALIDATION_ERROR', errors = null) {
        super(message, 400, errorCode, errors);
        this.name = 'ValidationError';
    }
}

module.exports = ValidationError;
