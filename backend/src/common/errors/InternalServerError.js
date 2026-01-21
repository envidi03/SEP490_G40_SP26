const BaseError = require('./BaseError');

class InternalServerError extends BaseError {
    constructor(message = 'Resource not found') {
        super(message, 500);
        this.name = 'InternalServerError';
    }
}

module.exports = InternalServerError;