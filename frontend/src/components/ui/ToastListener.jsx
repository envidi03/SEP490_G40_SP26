import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Toast from './Toast';

const ToastListener = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [toast, setToast] = useState(null);

    useEffect(() => {
        // First check session storage (most reliable against redirects)
        const pendingToast = sessionStorage.getItem('pendingToast');
        if (pendingToast) {
            try {
                setToast(JSON.parse(pendingToast));
            } catch (e) { }
            sessionStorage.removeItem('pendingToast');
        }
        // Fallback to router state
        else if (location.state && location.state.toast) {
            setToast(location.state.toast);

            // Clear the toast from location state so it doesn't show again on refresh/back
            const newState = { ...location.state };
            delete newState.toast;
            navigate(location.pathname, { state: newState, replace: true });
        }
    }, [location, navigate, isAuthenticated]);

    if (!toast) return null;

    return (
        <Toast
            show={!!toast}
            message={toast.message}
            type={toast.type || 'success'}
            onClose={() => setToast(null)}
            duration={toast.duration || 3000}
        />
    );
};

export default ToastListener;
