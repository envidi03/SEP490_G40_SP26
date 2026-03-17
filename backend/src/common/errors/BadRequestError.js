const BaseError = require('./BaseError');

class BadRequestError extends BaseError {
    constructor(message = 'Bad request', errorCode = 'BAD_REQUEST_ERROR', errors = null) {
        super(message, 400, errorCode, errors);
        this.name = 'BadRequestError';
    }
}

module.exports = BadRequestError;
