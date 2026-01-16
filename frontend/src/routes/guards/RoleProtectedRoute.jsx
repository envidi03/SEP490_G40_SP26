import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext';

/**
 * RoleProtectedRoute - Route guard kiểm tra quyền truy cập theo role
 * Redirect đến /unauthorized nếu user không có quyền
 * 
 * @param {ReactNode} children - Component con cần protect
 * @param {Array} allowedRoles - Mảng các roles được phép truy cập (e.g., ['Admin', 'Doctor'])
 */
const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, user, loading } = useAuth();

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
                </div>
            </div>
        );
    }

    // Not authenticated -> redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check if user has required role
    const hasRequiredRole = allowedRoles.length === 0 || allowedRoles.includes(user?.role);

    // User doesn't have required role -> redirect to unauthorized
    if (!hasRequiredRole) {
        return <Navigate to="/unauthorized" replace />;
    }

    // All checks passed -> render children
    return children;
};

RoleProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
    allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

export default RoleProtectedRoute;
