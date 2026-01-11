const BaseError = require('./BaseError');

class UnauthorizedError extends BaseError {
    constructor(message = 'Unauthorized') {
        super(message, 401);
        this.name = 'UnauthorizedError';
    }
}

module.exports = UnauthorizedError;
