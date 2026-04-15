import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { AuthUser } from '../types/auth';
import { tokenService } from '../services/tokenService';
import { authApi } from '../services/authApi';
import { authService } from '../services/authService';
import { useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setAuth: (user: AuthUser) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const queryClient = useQueryClient();

    const isAuthenticated = useMemo(() => !!user, [user]);

    useEffect(() => {
        initializeAuth();
    }, []);

    const initializeAuth = async () => {
        try {
            const token = await tokenService.getAccessToken();
            if (token) {
                const response = await authApi.getCurrentProfile();
                if (response?.data) {
                    const mappedUser = authService.mapProfileResponseToUser(response.data);
                    setUser(mappedUser);
                }
            }
        } catch (error: any) {
            // Only log if it's not a standard unauthorized/not found error during initial check
            const isAuthError = error?.response?.status === 401 || 
                              error?.response?.status === 404 || 
                              error?.message === 'No refresh token available';
            
            if (!isAuthError) {
                console.error('Failed to initialize auth:', error);
            }
            await tokenService.clearTokens();
        } finally {
            setIsLoading(false);
        }
    };

    const setAuth = (userData: AuthUser) => {
        setUser(userData);
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            // 1. Call backend logout if refresh token exists
            const refreshToken = await tokenService.getRefreshToken();
            if (refreshToken) {
                await authApi.logout(refreshToken).catch(err => {
                    if (__DEV__) console.warn('Backend logout failed:', err);
                });
            }

            // 2. Clear local storage tokens
            await authService.logout();

            // 3. Reset state
            setUser(null);

            // 4. Clear React Query cache
            queryClient.clear();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isLoading, setAuth, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
