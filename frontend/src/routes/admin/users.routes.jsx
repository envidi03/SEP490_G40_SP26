import DashboardLayout from '../../components/layout/DashboardLayout';
import UserList from '../../pages/admin/users/UserList';
import RoleBasedRoute from '../guards/RoleBasedRoute';

// User management routes - Admin only
const userRoutes = [
    {
        path: '/admin/users',
        element: (
            <RoleBasedRoute allowedRoles={['ADMIN_CLINIC']}>
                <DashboardLayout>
                    <UserList />
                </DashboardLayout>
            </RoleBasedRoute>
        )
    }
];

export default userRoutes;
