const BaseError = require('./BaseError');

class NotFoundError extends BaseError {
    constructor(message = 'Resource not found', errorCode = 'NOT_FOUND_ERROR', errors = null) {
        super(message, 404, errorCode, errors);
        this.name = 'NotFoundError';
    }
}

module.exports = NotFoundError;
