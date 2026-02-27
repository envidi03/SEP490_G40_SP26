const authRoutes = require('./routes/auth.route');
const profileRoutes = require('./routes/profile.route');
const authController = require('./controller/auth.controller');
const profileController = require('./controller/profile.controller');
const authService = require('./service/auth.service');
const profileService = require('./service/profile.service');
const Account = require('./models/account.model');
const AuthProvider = require('./models/auth-provider.model');
const EmailVerification = require('./models/email-verification.model');
const LoginAttempt = require('./models/login-attempt.model');
const PasswordReset = require('./models/password-reset.model');
const Permission = require('./models/permission.model');
const Role = require('./models/role.model');
const Session = require('./models/session.model');
const Profile = require('./models/profile.model');

const Model = require('./models/index.model');

module.exports = {
    authRoutes,
    profileRoutes,
    authController,
    profileController,
    authService,
    profileService,
    Account,
    AuthProvider,
    EmailVerification,
    LoginAttempt,
    PasswordReset,
    Permission,
    Role,
    Session,
    Profile,

    Model
};
