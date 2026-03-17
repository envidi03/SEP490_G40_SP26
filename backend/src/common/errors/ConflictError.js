const BaseError = require('./BaseError');

class ConflictError extends BaseError {
    constructor(message = 'Resource already exists', errorCode = 'CONFLICT_ERROR', errors = null) {
        super(message, 409, errorCode, errors);
        this.name = 'ConflictError';
    }
}

module.exports = ConflictError;
