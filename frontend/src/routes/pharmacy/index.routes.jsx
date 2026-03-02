import PharmacyLayout from '../../components/layout/PharmacyLayout';
import ProtectedRoute from '../guards/ProtectedRoute';

// Pharmacy Pages
import PharmacyMedicines from '../../pages/pharmacy/PharmacyMedicines';
import PharmacyInventory from '../../pages/pharmacy/PharmacyInventory';
import PharmacyPrescriptions from '../../pages/pharmacy/PharmacyPrescriptions';
import PharmacyRequests from '../../pages/pharmacy/PharmacyRequests';

/**
 * Pharmacy Routes - Protected routes for Pharmacy Assistant role
 */
const pharmacyRoutes = [
    {
        path: '/pharmacy/medicines',
        element: (
            <ProtectedRoute allowedRoles={['PHARMACY', 'ADMIN_CLINIC']}>
                <PharmacyLayout>
                    <PharmacyMedicines />
                </PharmacyLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/pharmacy/inventory',
        element: (
            <ProtectedRoute allowedRoles={['PHARMACY', 'ADMIN_CLINIC']}>
                <PharmacyLayout>
                    <PharmacyInventory />
                </PharmacyLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/pharmacy/prescriptions',
        element: (
            <ProtectedRoute allowedRoles={['PHARMACY', 'ADMIN_CLINIC']}>
                <PharmacyLayout>
                    <PharmacyPrescriptions />
                </PharmacyLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/pharmacy/requests',
        element: (
            <ProtectedRoute allowedRoles={['PHARMACY', 'ADMIN_CLINIC']}>
                <PharmacyLayout>
                    <PharmacyRequests />
                </PharmacyLayout>
            </ProtectedRoute>
        )
    }
];

export default pharmacyRoutes;
