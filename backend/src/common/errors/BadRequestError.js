const BaseError = require('./BaseError');

class BadRequestError extends BaseError {
    constructor(message = 'Bad request') {
        super(message, 400);
        this.name = 'BadRequestError';
    }
}

module.exports = BadRequestError;
