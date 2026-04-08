import { useMutation } from '@tanstack/react-query';
import apiClient from '@/src/services/api';

// Login
export function useLogin() {
    return useMutation({
        mutationFn: async (credentials: { identifier: string; password: string }) => {
            const { data } = await apiClient.post('/api/auth/login', credentials);
            return data;
        },
    });
}

// Register
export function useRegister() {
    return useMutation({
        mutationFn: async (credentials: any) => {
            const { data } = await apiClient.post('/api/auth/register', credentials);
            return data;
        },
    });
}

// Forgot Password
export function useForgotPassword() {
    return useMutation({
        mutationFn: async (email: string) => {
            const { data } = await apiClient.post('/api/auth/forgot-password', { email });
            return data;
        },
    });
}

// Reset Password
export function useResetPassword() {
    return useMutation({
        mutationFn: async (payload: { email: string; otp: string; newPassword: string }) => {
            const { data } = await apiClient.post('/api/auth/reset-password', payload);
            return data;
        },
    });
}

// Logout
export function useLogout() {
    return useMutation({
        mutationFn: async (refreshToken: string | null) => {
            const { data } = await apiClient.post('/api/auth/logout', { refreshToken });
            return data;
        },
    });
}
