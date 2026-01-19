import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedRoute from './guards/ProtectedRoute';
import MedicineList from '../pages/medicines/MedicineList';
import MedicineForm from '../pages/medicines/MedicineForm';

// Pharmacy/Medicine management routes
const medicineRoutes = [
    {
        path: '/medicines',
        element: (
            <ProtectedRoute>
                <DashboardLayout>
                    <MedicineList />
                </DashboardLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/medicines/new',
        element: (
            <ProtectedRoute>
                <DashboardLayout>
                    <MedicineForm />
                </DashboardLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/medicines/:id/edit',
        element: (
            <ProtectedRoute>
                <DashboardLayout>
                    <MedicineForm />
                </DashboardLayout>
            </ProtectedRoute>
        )
    }
];

export default medicineRoutes;
