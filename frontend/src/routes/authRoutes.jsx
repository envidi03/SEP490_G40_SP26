import DashboardLayout from '../components/layout/DashboardLayout';
import DashboardRoute from '../pages/dashboard/DashboardRoute';
import ProtectedRoute from './guards/ProtectedRoute';

/**
 * Auth Routes - Protected routes requiring authentication
 * Automatically redirects to appropriate dashboard based on user role
 */
const authRoutes = [
    {
        path: '/dashboard',
        element: (
            <ProtectedRoute>
                <DashboardLayout>
                    <DashboardRoute />
                </DashboardLayout>
            </ProtectedRoute>
        )
    }
];

export default authRoutes;
