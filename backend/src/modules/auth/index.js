const authRoutes = require('./auth.route');

const authController = require('./auth.controller');

const authService = require('./auth.service');

const Account = require('./models/Account.model');
const AuthProvider = require('./models/AuthProviders.model');
const EmailVerification = require('./models/EmailVerification.model');
const LoginAttempt = require('./models/LoginAttempt.model');
const PasswordReset = require('./models/PasswordReset.model');
const Permission = require('./models/Permission.model');
const Role = require('./models/Role.model');
const Session = require('./models/Session.model');
const User = require('./models/User.model');

module.exports = {
    authRoutes,

    authController,

    authService,

    Account,
    AuthProvider,
    EmailVerification,
    LoginAttempt,
    PasswordReset,
    Permission,
    Role,
    Session,
    User
};
