// Export doctor dashboard routes
import DashboardLayout from '../../components/layout/DashboardLayout';
import ProtectedRoute from '../guards/ProtectedRoute';
import DoctorDashboard from '../../pages/dashboard/DoctorDashboard';

const dashboardRoutes = [
    {
        path: '/doctor/dashboard',
        element: (
            <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DashboardLayout>
                    <DoctorDashboard />
                </DashboardLayout>
            </ProtectedRoute>
        )
    }
];

export default dashboardRoutes;
