const BaseError = require('./BaseError');

class UnauthorizedError extends BaseError {
    constructor(message = 'Unauthorized', errorCode = 'UNAUTHORIZED_ERROR', errors = null) {
        super(message, 401, errorCode, errors);
        this.errors = errors;
        this.name = 'UnauthorizedError';
    }
}

module.exports = UnauthorizedError;
