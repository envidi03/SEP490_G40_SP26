import DashboardLayout from '../../components/layout/DashboardLayout';
import ProtectedRoute from '../guards/ProtectedRoute';
import ProfilePage from '../../pages/profile/ProfilePage';
import ReceptionistLayout from '../../components/layout/receptionist/ReceptionistLayout';
import PharmacyLayout from '../../components/layout/PharmacyLayout';
import AssistantLayout from '../../components/layout/assistant/AssistantLayout';

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
                <ReceptionistLayout>
                    <ProfilePage />
                </ReceptionistLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/pharmacy/profile',
        element: (
            <ProtectedRoute allowedRoles={['PHARMACY']}>
                <PharmacyLayout>
                    <ProfilePage />
                </PharmacyLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/assistant/profile',
        element: (
            <ProtectedRoute allowedRoles={['ASSISTANT']}>
                <AssistantLayout>
                    <ProfilePage />
                </AssistantLayout>
            </ProtectedRoute>
        )
    }
];

export default profileRoutes;
