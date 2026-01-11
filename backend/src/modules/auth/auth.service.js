const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Account = require('../auth/models/Account.model');
const AuthProvider = require('../auth/models/AuthProviders.model');
const EmailVerification = require('../auth/models/EmailVerification.model');
const LoginAttempt = require('../auth/models/LoginAttempt.model');
const PasswordReset = require('../auth/models/PasswordReset.model');
const Permission = require('../auth/models/Permission.model');
const Role = require('../auth/models/Role.model');
const Session = require('../auth/models/Session.model');
const User = require('../auth/models/User.model');
require('dotenv').config();

exports.register = async (data) => {
    const { username, email, password, phone_number, full_name, dob, gender, address, avatar_url } = data
}