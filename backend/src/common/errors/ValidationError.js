const BaseError = require('./BaseError');

class ValidationError extends BaseError {
    constructor(message = 'Validation failed', errors = null) {
        super(message, 400, errors);
        this.name = 'ValidationError';
    }
}

module.exports = ValidationError;
