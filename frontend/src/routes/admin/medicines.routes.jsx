import DashboardLayout from '../../components/layout/DashboardLayout';
import MedicineList from '../../pages/admin/medicines/MedicineList';
import RoleBasedRoute from '../guards/RoleBasedRoute';

// Admin medicine management routes
const adminMedicineRoutes = [
    {
        path: '/admin/medicines',
        element: (
            <RoleBasedRoute allowedRoles={['ADMIN_CLINIC']}>
                <DashboardLayout>
                    <MedicineList />
                </DashboardLayout>
            </RoleBasedRoute>
        )
    }
];

export default adminMedicineRoutes;
