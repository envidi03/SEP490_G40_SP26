import AssistantLayout from '../../components/layout/AssistantLayout';
import ProtectedRoute from '../guards/ProtectedRoute';
import AssistantDashboard from '../../pages/dashboard/AssistantDashboard';

const dashboardRoutes = [
    {
        path: '/assistant/dashboard',
        element: (
            <ProtectedRoute allowedRoles={['ASSISTANT', 'ADMIN_CLINIC']}>
                <AssistantLayout>
                    <AssistantDashboard />
                </AssistantLayout>
            </ProtectedRoute>
        )
    }
];

export default dashboardRoutes;
