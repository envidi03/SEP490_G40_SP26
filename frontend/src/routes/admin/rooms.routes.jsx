import DashboardLayout from '../../components/layout/DashboardLayout';
import RoleBasedRoute from '../guards/RoleBasedRoute';
import RoomList from '../../pages/admin/rooms/RoomList';

// Admin rooms management routes
const adminRoomRoutes = [
    {
        path: '/admin/rooms',
        element: (
            <RoleBasedRoute allowedRoles={['ADMIN_CLINIC']}>
                <DashboardLayout>
                    <RoomList />
                </DashboardLayout>
            </RoleBasedRoute>
        )
    }
];

export default adminRoomRoutes;
