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
        mutationFn: async (credentials: { identifier: string; password: string }) => {
            const { data } = await apiClient.post('/api/auth/register', credentials);
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
