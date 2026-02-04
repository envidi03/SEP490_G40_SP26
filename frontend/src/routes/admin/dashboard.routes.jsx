import DashboardLayout from '../../components/layout/DashboardLayout';
import RoleBasedRoute from '../guards/RoleBasedRoute';
import AdminClinicDashboard from '../../pages/dashboard/AdminClinicDashboard';

// Admin dashboard route
const dashboardRoutes = [
    {
        path: '/admin/dashboard',
        element: (
            <RoleBasedRoute allowedRoles={['ADMIN_CLINIC']}>
                <DashboardLayout>
                    <AdminClinicDashboard />
                </DashboardLayout>
            </RoleBasedRoute>
        )
    }
];

export default dashboardRoutes;
