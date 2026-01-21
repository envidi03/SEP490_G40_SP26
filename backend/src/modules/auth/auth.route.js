const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { authenticate } = require('../../common/middlewares');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/verify-email', authController.verifyEmail);
router.post('/resend-verification-email', authController.resendVerificationEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/google', authController.googleAuth);

router.post('/logout', authenticate, authController.logout);
router.post('/refresh-token', authenticate, authController.refreshToken);
router.post('/change-password', authenticate, authController.changePassword);

module.exports = router;
