const BaseError = require('./BaseError');

class ForbiddenError extends BaseError {
    constructor(message = 'Forbidden - You do not have permission', errorCode = 'FORBIDDEN_ERROR', errors = null) {
        super(message, 403, errorCode, errors);
        this.name = 'ForbiddenError';
    }
}

module.exports = ForbiddenError;
