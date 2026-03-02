import axios from 'axios';
import { storage, sessionStorage } from './storage';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds
});

// Flag to prevent multiple refresh calls
let isRefreshing = false;
// Queue to hold requests while refreshing
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

apiClient.interceptors.request.use(
    (config) => {
        const token = storage.get('access_token') || sessionStorage.get('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        const originalRequest = error.config;

        // If error is not 401 or request is already retried, reject
        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        // Check if URL is login or refresh token endpoint to avoid infinite loops
        if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/refresh-token')) {
            // If refresh fails, clear tokens and redirect
            if (originalRequest.url.includes('/auth/refresh-token')) {
                storage.remove('access_token');
                storage.remove('refresh_token');
                sessionStorage.remove('access_token');
                sessionStorage.remove('refresh_token');
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }

        if (isRefreshing) {
            // Check if queue is active
            return new Promise(function (resolve, reject) {
                failedQueue.push({ resolve, reject });
            })
                .then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return apiClient(originalRequest);
                })
                .catch(err => {
                    return Promise.reject(err);
                });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = storage.get('refresh_token') || sessionStorage.get('refresh_token');

        if (!refreshToken) {
            window.location.href = '/login';
            return Promise.reject(error);
        }

        try {
            // Call refresh token API directly using axios to avoid interceptors
            const response = await axios.post(`${API_BASE_URL}/api/auth/refresh-token`, {
                refreshToken
            });

            const { access_token } = response.data.data;

            // Update tokens
            if (storage.get('refresh_token')) {
                storage.set('access_token', access_token);
            } else {
                sessionStorage.set('access_token', access_token);
            }

            // Update header for original request
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
            originalRequest.headers.Authorization = `Bearer ${access_token}`;

            // Process queue
            processQueue(null, access_token);

            return apiClient(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, null);
            // Clear tokens and redirect
            storage.remove('access_token');
            storage.remove('refresh_token');
            sessionStorage.remove('access_token');
            sessionStorage.remove('refresh_token');
            window.location.href = '/login';
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default apiClient;
