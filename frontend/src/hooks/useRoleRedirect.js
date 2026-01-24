import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardRoute, hasDashboard } from '../utils/roleConfig';

/**
 * Hook to automatically redirect authenticated users to their dashboard based on role.
 * Useful for public pages like Home or Login where logged-in users should be forwarded.
 */
const useRoleRedirect = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // If user is authenticated and has a specific dashboard (not Patient), redirect
        if (user && user.role && hasDashboard(user.role)) {
            const dashboardRoute = getDashboardRoute(user.role);
            navigate(dashboardRoute, { replace: true });
        }
    }, [user, navigate]);
};

export default useRoleRedirect;
