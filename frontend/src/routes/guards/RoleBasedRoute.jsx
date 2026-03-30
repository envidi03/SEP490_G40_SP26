import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const RoleBasedRoute = ({ children, allowedRoles = [] }) => {
    const { user, isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Forward location state if present (especially for toasts during logout)
        return <Navigate to="/" state={location.state} replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/dashboard" state={location.state} replace />;
    }

    return children;
};

export default RoleBasedRoute;
