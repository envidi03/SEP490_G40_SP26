const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
require('dotenv').config();

function signToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, process.env.JWT_EXPIRES_IN || '1h');
}

function signRefreshToken(payload) {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, process.env.JWT_REFRESH_EXPIRES_IN || '7d');
}

function verifyToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
}

function hashToken(token) {
    return bcrypt.hashSync(token, 12);
}

function compareToken(token, hash) {
    return bcrypt.compareSync(token, hash);
}

function fingerprintToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = {
    signToken,
    signRefreshToken,
    verifyToken,
    hashToken,
    compareToken,
    fingerprintToken
};