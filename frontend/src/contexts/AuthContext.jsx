import React, { createContext, useState, useContext, useEffect } from 'react';
import { storage } from '../services/storage';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check both storages for saved user
        // Priority: localStorage (remembered) -> sessionStorage (current session)
        const savedUser = storage.get('dcms_user') || sessionStorage.getItem('dcms_user');

        if (savedUser) {
            try {
                // If from sessionStorage, it's a string. If from storage wrapper, it might be object depending on implementation.
                // storage.get returns parsed object. sessionStorage.getItem returns string.
                const userObj = typeof savedUser === 'string' ? JSON.parse(savedUser) : savedUser;
                setUser(userObj);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Error parsing saved user:', error);
                storage.remove('dcms_user');
                sessionStorage.removeItem('dcms_user');
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
            sessionStorage.setItem('dcms_user', JSON.stringify(userData));
        }
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        storage.remove('dcms_user');
        sessionStorage.removeItem('dcms_user');
    };

    const updateUser = (updatedData) => {
        const newUserData = { ...user, ...updatedData };
        setUser(newUserData);

        // Update wherever it exists
        if (storage.get('dcms_user')) {
            storage.set('dcms_user', newUserData);
        }
        if (sessionStorage.getItem('dcms_user')) {
            sessionStorage.setItem('dcms_user', JSON.stringify(newUserData));
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
