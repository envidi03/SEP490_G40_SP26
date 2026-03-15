const BaseError = require('./BaseError');

class InternalServerError extends BaseError {
    constructor(message = 'Internal Server Error', errorCode = 'INTERNAL_SERVER_ERROR', errors = null) {
        super(message, 500, errorCode, errors);
        this.name = 'InternalServerError';
    }
}

module.exports = InternalServerError;