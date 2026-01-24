import apiClient from './api';
import { sessionStorage } from './storage';

const authService = {
    /**
     * Register new user account
     * @param {Object} userData - User registration data
     * @returns {Promise} API response
     */
    register: async (userData) => {
        try {
            const response = await apiClient.post('/api/auth/register', userData);
            return response;
        } catch (error) {
            throw error.response || error;
        }
    },

    /**
     * Login user
     * @param {string} username - Username or email
     * @param {string} password - Password
     * @returns {Promise} API response with tokens and user data
     */
    login: async (username, password) => {
        try {
            const payload = { identifier: username, password };

            const response = await apiClient.post('/api/auth/login', payload);

            // Save tokens using storage service
            // Backend returns 'token' and 'refreshToken' not 'access_token' and 'refresh_token'
            if (response.data?.token || response.token) {
                const accessToken = response.data?.token || response.token;
                const refreshToken = response.data?.refreshToken || response.refreshToken;

                sessionStorage.set('access_token', accessToken);
                sessionStorage.set('refresh_token', refreshToken);
            }

            return response;
        } catch (error) {
            console.error('❌ Login Error:', error);
            console.error('Error Response:', error.response);
            throw error.response || error;
        }
    },

    /**
     * Logout user
     * @param {string} refreshToken - Refresh token
     * @returns {Promise}
     */
    logout: async (refreshToken) => {
        try {
            await apiClient.post('/api/auth/logout', { refreshToken });
        } finally {
            sessionStorage.remove('access_token');
            sessionStorage.remove('refresh_token');
        }
    },

    /**
     * Refresh access token
     * @param {string} refreshToken - Refresh token
     * @returns {Promise} New access token
     */
    refreshToken: async (refreshToken) => {
        try {
            const response = await apiClient.post('/api/auth/refresh-token', { refreshToken });

            if (response.data.access_token) {
                sessionStorage.set('access_token', response.data.access_token);
            }

            return response;
        } catch (error) {
            throw error.response || error;
        }
    },

    /**
     * Change password
     * @param {string} currentPassword - Current password
     * @param {string} newPassword - New password
     * @returns {Promise}
     */
    changePassword: async (currentPassword, newPassword) => {
        try {
            const response = await apiClient.post('/api/auth/change-password', {
                currentPassword,
                newPassword
            });
            return response;
        } catch (error) {
            throw error.response || error;
        }
    },

    /**
     * Forgot password - Send OTP to email
     * @param {string} email - User email
     * @returns {Promise}
     */
    forgotPassword: async (email) => {
        try {
            const response = await apiClient.post('/api/auth/forgot-password', { email });
            return response;
        } catch (error) {
            throw error.response || error;
        }
    },

    /**
     * Reset password with OTP
     * @param {string} email - User email
     * @param {string} otp - OTP code
     * @param {string} newPassword - New password
     * @returns {Promise}
     */
    resetPassword: async (email, otp, newPassword) => {
        try {
            const response = await apiClient.post('/api/auth/reset-password', {
                email,
                otp,
                newPassword
            });
            return response;
        } catch (error) {
            throw error.response || error;
        }
    },

    /**
     * Verify email with token
     * @param {string} token - Verification token
     * @returns {Promise}
     */
    verifyEmail: async (token) => {
        try {
            const response = await apiClient.get(`/api/auth/verify-email?token=${token}`);
            return response;
        } catch (error) {
            throw error.response?.data || error.response || error;
        }
    },

    /**
     * Resend verification email
     * @param {string} email - User email
     * @returns {Promise}
     */
    resendVerificationEmail: async (email) => {
        try {
            const response = await apiClient.post('/api/auth/resend-verification-email', { email });
            return response;
        } catch (error) {
            throw error.response || error;
        }
    },

    /**
     * Google OAuth login
     * @param {string} googleToken - Google ID token
     * @returns {Promise}
     */
    googleAuth: async (googleToken) => {
        try {
            const response = await apiClient.post('/api/auth/google', { googleToken });

            // Save tokens
            if (response.data.access_token) {
                sessionStorage.set('access_token', response.data.access_token);
                sessionStorage.set('refresh_token', response.data.refresh_token);
            }

            return response;
        } catch (error) {
            throw error.response || error;
        }
    }
};

export default authService;
