import DashboardLayout from '../../components/layout/DashboardLayout';
import ProtectedRoute from '../guards/ProtectedRoute';
import ReceptionistDashboard from '../../pages/dashboard/ReceptionistDashboard';

const dashboardRoutes = [
    {
        path: '/receptionist/dashboard',
        element: (
            <ProtectedRoute allowedRoles={['RECEPTIONIST', 'ADMIN_CLINIC']}>
                <DashboardLayout>
                    <ReceptionistDashboard />
                </DashboardLayout>
            </ProtectedRoute>
        )
    }
];

export default dashboardRoutes;
