import ProtectedRoute from '../guards/ProtectedRoute';
import ReceptionistLayout from '../../components/layout/ReceptionistLayout';
// Receptionist Pages
import ReceptionistPatients from '../../pages/receptionist/ReceptionistPatients';
import ReceptionistAppointments from '../../pages/receptionist/ReceptionistAppointments';
import ReceptionistInvoices from '../../pages/receptionist/ReceptionistInvoices';
import ReceptionistServices from '../../pages/receptionist/ReceptionistServices';
import ReceptionistEquipment from '../../pages/receptionist/ReceptionistEquipment';

/**
 * Receptionist Routes - Protected routes for Receptionist role
 */
const receptionistRoutes = [
    {
        path: '/receptionist/patients',
        element: (
            <ProtectedRoute allowedRoles={['RECEPTIONIST', 'ADMIN_CLINIC']}>
                <ReceptionistLayout>
                    <ReceptionistPatients />
                </ReceptionistLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/receptionist/appointments',
        element: (
            <ProtectedRoute allowedRoles={['RECEPTIONIST', 'ADMIN_CLINIC']}>
                <ReceptionistLayout>
                    <ReceptionistAppointments />
                </ReceptionistLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/receptionist/invoices',
        element: (
            <ProtectedRoute allowedRoles={['RECEPTIONIST', 'ADMIN_CLINIC']}>
                <ReceptionistLayout>
                    <ReceptionistInvoices />
                </ReceptionistLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/receptionist/services',
        element: (
            <ProtectedRoute allowedRoles={['RECEPTIONIST', 'ADMIN_CLINIC']}>
                <ReceptionistLayout>
                    <ReceptionistServices />
                </ReceptionistLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/receptionist/equipment',
        element: (
            <ProtectedRoute allowedRoles={['RECEPTIONIST', 'ADMIN_CLINIC']}>
                <ReceptionistLayout>
                    <ReceptionistEquipment />
                </ReceptionistLayout>
            </ProtectedRoute>
        )
    }
];

export default receptionistRoutes;
