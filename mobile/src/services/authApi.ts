import apiClient from './api';
import { LoginResponse } from '../types/auth';

export const authApi = {
    async login(credentials: any): Promise<{ data: LoginResponse }> {
        const { data } = await apiClient.post('/api/auth/login', credentials);
        return data;
    },

    async register(data: any) {
        const response = await apiClient.post('/api/auth/register', data);
        return response.data;
    },

    async forgotPassword(email: string) {
        const response = await apiClient.post('/api/auth/forgot-password', { email });
        return response.data;
    },

    async resetPassword(payload: any) {
        const response = await apiClient.post('/api/auth/reset-password', payload);
        return response.data;
    },

    async refreshToken(refreshToken: string) {
        const response = await apiClient.post('/api/auth/refresh-token', { refreshToken });
        return response.data;
    },

    async getCurrentProfile() {
        const response = await apiClient.get('/api/profile');
        return response.data;
    },

    async logout(refreshToken: string) {
        const response = await apiClient.post('/api/auth/logout', { refreshToken });
        return response.data;
    },
};
