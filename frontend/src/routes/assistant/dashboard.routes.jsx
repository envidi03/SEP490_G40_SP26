import DashboardLayout from '../../components/layout/DashboardLayout';
import ProtectedRoute from '../guards/ProtectedRoute';
import AssistantDashboard from '../../pages/dashboard/AssistantDashboard';

const dashboardRoutes = [
    {
        path: '/assistant/dashboard',
        element: (
            <ProtectedRoute allowedRoles={['ASSISTANT', 'ADMIN_CLINIC']}>
                <DashboardLayout>
                    <AssistantDashboard />
                </DashboardLayout>
            </ProtectedRoute>
        )
    }
];

export default dashboardRoutes;
