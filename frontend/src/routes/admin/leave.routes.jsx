import DashboardLayout from '../../components/layout/DashboardLayout';
import AdminLeaveList from '../../pages/admin/leave/AdminLeaveList';
import RoleBasedRoute from '../guards/RoleBasedRoute';

// Admin Leave management routes
const leaveRoutes = [
    {
        path: '/admin/leave-management',
        element: (
            <RoleBasedRoute allowedRoles={['ADMIN_CLINIC']}>
                <DashboardLayout>
                    <AdminLeaveList />
                </DashboardLayout>
            </RoleBasedRoute>
        )
    }
];

export default leaveRoutes;
