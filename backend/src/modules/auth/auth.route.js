const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');

// Public routes (no authentication required)
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/verify-email', authController.verifyEmail);
router.post('/resend-verification-email', authController.resendVerificationEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/google', authController.googleAuth);

// Protected routes (require authentication)
// TODO: Add authentication middleware
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.post('/change-password', authController.changePassword);

module.exports = router;
