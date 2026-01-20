import DashboardLayout from '../../components/layout/DashboardLayout';
import ProtectedRoute from '../guards/ProtectedRoute';
import ProfilePage from '../../pages/profile/ProfilePage';

/**
 * Profile Routes - Shared profile page for all roles
 */
const profileRoutes = [
    {
        path: '/admin/profile',
        element: (
            <ProtectedRoute allowedRoles={['ADMIN_CLINIC']}>
                <DashboardLayout>
                    <ProfilePage />
                </DashboardLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/doctor/profile',
        element: (
            <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DashboardLayout>
                    <ProfilePage />
                </DashboardLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/receptionist/profile',
        element: (
            <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
                <DashboardLayout>
                    <ProfilePage />
                </DashboardLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/pharmacy/profile',
        element: (
            <ProtectedRoute allowedRoles={['PHARMACY']}>
                <DashboardLayout>
                    <ProfilePage />
                </DashboardLayout>
            </ProtectedRoute>
        )
    }
];

export default profileRoutes;
