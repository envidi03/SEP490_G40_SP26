// errors/InternalServerError.js
const BaseError = require("./BaseError");

class InternalServerError extends BaseError {
    constructor(message = "Internal server error") {
        super(message, 500);
    }
}

module.exports = InternalServerError;
