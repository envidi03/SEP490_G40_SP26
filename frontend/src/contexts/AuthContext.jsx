import React, { createContext, useState, useContext, useEffect } from 'react';
import { storage, sessionStorage as sessionStorageService } from '../services/storage';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check both storages for saved user
        // Priority: localStorage (remembered) -> sessionStorage (current session)
        const savedUser = storage.get('dcms_user') || sessionStorageService.get('dcms_user');

        if (savedUser) {
            try {
                // storage.get / sessionStorageService.get đã trả về parsed object
                const userObj = typeof savedUser === 'string' ? JSON.parse(savedUser) : savedUser;
                setUser(userObj);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Error parsing saved user:', error);
                storage.remove('dcms_user');
                sessionStorageService.remove('dcms_user');
            }
        }
        setLoading(false);
    }, []);

    const login = (userData, remember = false) => {
        setUser(userData);
        setIsAuthenticated(true);
        if (remember) {
            storage.set('dcms_user', userData);
        } else {
            sessionStorageService.set('dcms_user', userData);
        }
    };

    const logout = async () => {
        // Lấy refresh token từ storage (ưu tiên localStorage, sau đó sessionStorage)
        const refreshToken = storage.get('refresh_token') || sessionStorageService.get('refresh_token');

        // Xóa token & user info ở frontend trước (đảm bảo UI cập nhật ngay)
        setUser(null);
        setIsAuthenticated(false);
        storage.remove('access_token');
        storage.remove('refresh_token');
        storage.remove('dcms_user');
        sessionStorageService.remove('access_token');
        sessionStorageService.remove('refresh_token');
        sessionStorageService.remove('dcms_user');

        // Gọi API invalidate session trên server (fire & forget)
        if (refreshToken) {
            authService.logout(refreshToken).catch(() => {
                // Bỏ qua lỗi - user đã logout ở client rồi
            });
        }
    };

    const updateUser = (updatedData) => {
        const newUserData = { ...user, ...updatedData };
        setUser(newUserData);

        // Update wherever it exists
        if (storage.get('dcms_user')) {
            storage.set('dcms_user', newUserData);
        }
        if (sessionStorageService.get('dcms_user')) {
            sessionStorageService.set('dcms_user', newUserData);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                loading,
                login,
                logout,
                updateUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export default AuthContext;
