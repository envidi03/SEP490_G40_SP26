import ProtectedRoute from '../guards/ProtectedRoute';
import ReceptionistDashboard from '../../pages/dashboard/ReceptionistDashboard';
import ReceptionistLayout from '../../components/layout/receptionist/ReceptionistLayout';

const dashboardRoutes = [
    {
        path: '/receptionist/dashboard',
        element: (
            <ProtectedRoute allowedRoles={['RECEPTIONIST', 'ADMIN_CLINIC']}>
                <ReceptionistLayout>
                    <ReceptionistDashboard />
                </ReceptionistLayout>
            </ProtectedRoute>
        )
    }
];

export default dashboardRoutes;
