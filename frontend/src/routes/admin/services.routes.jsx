import DashboardLayout from '../../components/layout/DashboardLayout';
import RoleBasedRoute from '../guards/RoleBasedRoute';
import ServiceList from '../../pages/admin/services/ServiceList';

// Admin services management routes
const adminServicesRoutes = [
    {
        path: '/admin/services',
        element: (
            <RoleBasedRoute allowedRoles={['ADMIN_CLINIC']}>
                <DashboardLayout>
                    <ServiceList />
                </DashboardLayout>
            </RoleBasedRoute>
        )
    }
];

export default adminServicesRoutes;
