const { authenticate, authorize, optionalAuth } = require('./auth.middleware');
const errorHandler = require('./errorHandler.middleware');

module.exports = {
    authenticate,
    authorize,
    optionalAuth,

    errorHandler
};
