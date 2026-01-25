import axios from 'axios';
import { storage } from './storage';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds
});


apiClient.interceptors.request.use(
    (config) => {
        const token = storage.get('access_token');
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

        // Only redirect if 401 AND it's NOT a login attempt
        // (Login attempts return 401 on wrong password, we should let the component handle it)
        if (error.response?.status === 401 && !originalRequest.url.includes('/auth/login')) {
            // Token expired - clear tokens and redirect to login
            storage.remove('access_token');
            storage.remove('refresh_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;
