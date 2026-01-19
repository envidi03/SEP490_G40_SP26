import DashboardLayout from '../../components/layout/DashboardLayout';
import ProtectedRoute from '../guards/ProtectedRoute';
import PharmacyDashboard from '../../pages/dashboard/PharmacyDashboard';

const dashboardRoutes = [
    {
        path: '/pharmacy/dashboard',
        element: (
            <ProtectedRoute allowedRoles={['PHARMACY', 'ADMIN_CLINIC']}>
                <DashboardLayout>
                    <PharmacyDashboard />
                </DashboardLayout>
            </ProtectedRoute>
        )
    }
];

export default dashboardRoutes;
