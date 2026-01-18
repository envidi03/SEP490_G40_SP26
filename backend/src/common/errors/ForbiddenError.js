const BaseError = require('./BaseError');

class ForbiddenError extends BaseError {
    constructor(message = 'Forbidden - You do not have permission') {
        super(message, 403);
        this.name = 'ForbiddenError';
    }
}

module.exports = ForbiddenError;
