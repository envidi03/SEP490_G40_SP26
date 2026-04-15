import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { authApi } from '../services/authApi';
import { QUERY_KEYS } from '../constants/queryKeys';

// Login Hook
export function useLogin() {
    return useMutation({
        mutationFn: (credentials: any) => authService.login(credentials),
    });
}

// Logout Hook
export function useLogout() {
    return useMutation({
        mutationFn: (refreshToken: string) => authApi.logout(refreshToken),
    });
}

// Register Hook
export function useRegister() {
    return useMutation({
        mutationFn: (data: any) => authApi.register(data),
    });
}

// Forgot Password Hooks
export function useForgotPassword() {
    return useMutation({
        mutationFn: (email: string) => authApi.forgotPassword(email),
    });
}

export function useResetPassword() {
    return useMutation({
        mutationFn: (payload: any) => authApi.resetPassword(payload),
    });
}

// Profile/Session Hooks (can be added here using useQuery)
export function useInvalidateAuth(queryClient: any) {
    return () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.PROFILE });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH.SESSION });
    };
}
