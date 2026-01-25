import DashboardLayout from '../components/layout/DashboardLayout';
import RoleBasedRoute from './guards/RoleBasedRoute';
import UserList from '../pages/users/UserList';

// User management routes - Admin only
const userRoutes = [
    {
        path: '/users',
        element: (
            <RoleBasedRoute allowedRoles={['Admin']}>
                <DashboardLayout>
                    <UserList />
                </DashboardLayout>
            </RoleBasedRoute>
        )
    }
];

export default userRoutes;
