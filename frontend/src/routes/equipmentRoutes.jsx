import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedRoute from './guards/ProtectedRoute';
import EquiqmentList from '../pages/equipment/EquiqmentList';
import EquipmentForm from '../pages/equipment/EquipmentForm';
import Maintenance from '../pages/equipment/Maintenance';

// Equipment management routes
const equipmentRoutes = [
    {
        path: '/equipment',
        element: (
            <ProtectedRoute>
                <DashboardLayout>
                    <EquiqmentList />
                </DashboardLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/equipment/new',
        element: (
            <ProtectedRoute>
                <DashboardLayout>
                    <EquipmentForm />
                </DashboardLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/equipment/:id/edit',
        element: (
            <ProtectedRoute>
                <DashboardLayout>
                    <EquipmentForm />
                </DashboardLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/equipment/maintenance',
        element: (
            <ProtectedRoute>
                <DashboardLayout>
                    <Maintenance />
                </DashboardLayout>
            </ProtectedRoute>
        )
    }
];

export default equipmentRoutes;
