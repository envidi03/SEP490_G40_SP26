import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getDashboardRoute, hasDashboard } from '../../utils/roleConfig';

const PublicRoute = ({ children, allowPatient = false }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>;
    }

    if (user && user.role) {
        // Forward location state if present (e.g., from Login, bookingData, toast)
        const navigationState = location.state || {};
        
        // Let explicit `from` navigation happen if it was specified
        if (navigationState.from) {
             return <Navigate to={navigationState.from} state={navigationState} replace />;
        }

        if (hasDashboard(user.role)) {
            const dashboardRoute = getDashboardRoute(user.role);
            return <Navigate to={dashboardRoute} state={navigationState} replace />;
        }

        if (allowPatient) {
            return children || <Outlet />;
        }

        return <Navigate to="/" state={navigationState} replace />;
    }

    return children || <Outlet />;
};

export default PublicRoute;
