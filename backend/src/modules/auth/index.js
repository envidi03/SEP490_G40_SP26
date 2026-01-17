// Auth Module - Central Export Point

// Routes
const authRoutes = require('./auth.route');

// Controllers
const authController = require('./auth.controller');

// Services
const authService = require('./auth.service');

// Models
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
    // Routes
    authRoutes,

    // Controllers
    authController,

    // Services
    authService,

    // Models
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
