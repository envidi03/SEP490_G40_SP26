const authRoutes = require('./routes/auth.route');

const authController = require('./controller/auth.controller');

const authService = require('./service/auth.service');

const Account = require('./models/account.model');
const AuthProvider = require('./models/auth-provider.model');
const EmailVerification = require('./models/email-verification.model');
const LoginAttempt = require('./models/login-attempt.model');
const PasswordReset = require('./models/password-reset.model');
const Permission = require('./models/permission.model');
const Role = require('./models/role.model');
const Session = require('./models/session.model');
const Profile = require('./models/profile.model');

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
    Profile
};
