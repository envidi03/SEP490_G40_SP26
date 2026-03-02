import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getDashboardRoute, hasDashboard } from '../../utils/roleConfig';

const PublicRoute = ({ children, allowPatient = false }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>;
    }

    if (user && user.role) {
        if (hasDashboard(user.role)) {
            const dashboardRoute = getDashboardRoute(user.role);
            return <Navigate to={dashboardRoute} replace />;
        }

        if (allowPatient) {
            return children || <Outlet />;
        }

        return <Navigate to="/" replace />;
    }

    return children || <Outlet />;
};

export default PublicRoute;
