import PharmacyLayout from '../../components/layout/PharmacyLayout';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ProtectedRoute from '../guards/ProtectedRoute';
import PharmacyDashboard from '../../pages/dashboard/PharmacyDashboard';

const dashboardRoutes = [
    {
        path: '/pharmacy/dashboard',
        element: (
            <ProtectedRoute allowedRoles={['PHARMACY', 'ADMIN_CLINIC']}>
                <PharmacyLayout>
                    <PharmacyDashboard />
                </PharmacyLayout>
            </ProtectedRoute>
        )
    }
];

export default dashboardRoutes;
