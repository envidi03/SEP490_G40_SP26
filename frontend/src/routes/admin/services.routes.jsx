import DashboardLayout from '../../components/layout/DashboardLayout';
import RoleBasedRoute from '../guards/RoleBasedRoute';
import ServiceList from '../../pages/admin/services/ServiceList';
import SubServiceList from '../../pages/admin/services/SubServiceList';

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
    },
    {
        path: '/admin/services/:serviceId/sub-services',
        element: (
            <RoleBasedRoute allowedRoles={['ADMIN_CLINIC']}>
                <DashboardLayout>
                    <SubServiceList />
                </DashboardLayout>
            </RoleBasedRoute>
        )
    }
];

export default adminServicesRoutes;
