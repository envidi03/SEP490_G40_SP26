const BaseError = require('./BaseError');

class NotFoundError extends BaseError {
    constructor(message = 'Resource not found') {
        super(message, 404);
        this.name = 'NotFoundError';
    }
}

module.exports = NotFoundError;
