const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();

function signToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    });
}

function signRefreshToken(payload, expiryDays = 7) {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: `${expiryDays}d`
    });
}

function verifyRefreshToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('REFRESH_TOKEN_EXPIRED');
        }
        if (error.name === 'JsonWebTokenError') {
            throw new Error('INVALID_REFRESH_TOKEN');
        }
        throw error;
    }
}

function verifyToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('TOKEN_EXPIRED');
        }
        if (error.name === 'JsonWebTokenError') {
            throw new Error('INVALID_TOKEN');
        }
        throw error;
    }
}

function decodeToken(token) {
    return jwt.decode(token);
}

function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

function compareToken(token, hash) {
    const tokenHash = hashToken(token);
    if (tokenHash.length !== hash.length) {
        return false;
    }
    return crypto.timingSafeEqual(
        Buffer.from(tokenHash, 'hex'),
        Buffer.from(hash, 'hex')
    );
}

module.exports = {
    signToken,
    signRefreshToken,
    verifyToken,
    verifyRefreshToken,
    decodeToken,
    hashToken,
    compareToken
};