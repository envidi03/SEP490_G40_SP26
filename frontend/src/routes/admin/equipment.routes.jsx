import DashboardLayout from '../../components/layout/DashboardLayout';
import RoleBasedRoute from '../guards/RoleBasedRoute';
import EquipmentList from '../../pages/admin/equipments/EquipmentList';


// Admin equipment management routes
const adminEquipmentRoutes = [
    {
        path: '/admin/equipment',
        element: (
            <RoleBasedRoute allowedRoles={['ADMIN_CLINIC']}>
                <DashboardLayout>
                    <EquipmentList />
                </DashboardLayout>
            </RoleBasedRoute>
        )
    }
];

export default adminEquipmentRoutes;
