import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check localStorage for saved user
        const savedUser = localStorage.getItem('dcms_user');
        if (savedUser) {
            try {
                const userData = JSON.parse(savedUser);
                setUser(userData);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Error parsing saved user:', error);
                localStorage.removeItem('dcms_user');
            }
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('dcms_user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('dcms_user');
    };

    const updateUser = (updatedData) => {
        const newUserData = { ...user, ...updatedData };
        setUser(newUserData);
        localStorage.setItem('dcms_user', JSON.stringify(newUserData));
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
