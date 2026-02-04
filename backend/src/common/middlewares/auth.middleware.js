const { verifyToken } = require('../utils/jwt');
const { UnauthorizedError, ForbiddenError } = require('../errors');
const Account = require('../../modules/auth/models/account.model');
const logger = require('../utils/logger');


const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('No token provided');
        }

        const token = authHeader.substring(7);

        let decoded;
        try {
            decoded = verifyToken(token);
        } catch (error) {
            if (error.message === 'TOKEN_EXPIRED') {
                throw new UnauthorizedError('Token expired');
            }
            if (error.message === 'INVALID_TOKEN') {
                throw new UnauthorizedError('Invalid token');
            }
            throw new UnauthorizedError('Token verification failed');
        }
        const account = await Account.findById(decoded.account_id).populate('role_id');

        if (!account) {
            throw new UnauthorizedError('Account not found');
        }

        if (account.status === 'INACTIVE') {
            throw new ForbiddenError('Account is inactive');
        }

        if (account.status === 'PENDING') {
            throw new ForbiddenError('Please verify your email');
        }

        req.user = {
            account_id: account._id,
            user_id: decoded.user_id,
            email: account.email,
            username: account.username,
            role: account.role_id
        };

        next();
    } catch (error) {
        next(error);
    }
};


const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                throw new UnauthorizedError('Authentication required');
            }

            const userRole = req.user.role?.name;

            if (!userRole) {
                throw new ForbiddenError('No role assigned');
            }

            if (!allowedRoles.includes(userRole)) {
                throw new ForbiddenError(`Access denied. Required role: ${allowedRoles.join(' or ')}`);
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};


const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.substring(7);

        try {
            const decoded = verifyToken(token);
            const account = await Account.findById(decoded.account_id).populate('role_id');

            if (account && account.status === 'ACTIVE') {
                req.user = {
                    account_id: account._id,
                    user_id: decoded.user_id,
                    email: account.email,
                    username: account.username,
                    role: account.role_id
                };
            }
        } catch (error) {
        }

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    authenticate,
    authorize,
    optionalAuth
};
