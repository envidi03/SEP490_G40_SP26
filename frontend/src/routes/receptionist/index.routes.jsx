import ProtectedRoute from '../guards/ProtectedRoute';
import ReceptionistLayout from '../../components/layout/receptionist/ReceptionistLayout';
// Receptionist Pages
import ReceptionistPatients from '../../pages/receptionist/ReceptionistPatients';
import ReceptionistAppointments from '../../pages/receptionist/ReceptionistAppointments';
import ReceptionistInvoices from '../../pages/receptionist/ReceptionistInvoices';
import ReceptionistServices from '../../pages/receptionist/ReceptionistServices';
import ReceptionistEquipment from '../../pages/receptionist/ReceptionistEquipment';
import ReceptionistLeave from '../../pages/receptionist/ReceptionistLeave';
import ReceptionistCheckIn from '../../pages/receptionist/ReceptionistCheckIn';
import ReceptionistSubServices from '../../pages/receptionist/ReceptionistSubServices';
import ReBooking from '../../pages/receptionist/re-booking/ReBooking';
import Booking from '../../pages/receptionist/booking/Booking';

/**
 * Receptionist Routes - Protected routes for Receptionist role
 */
const receptionistRoutes = [
    {
        path: '/receptionist/check-in',
        element: (
            <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
                <ReceptionistLayout>
                    <ReceptionistCheckIn />
                </ReceptionistLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/receptionist/patients',
        element: (
            <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
                <ReceptionistLayout>
                    <ReceptionistPatients />
                </ReceptionistLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/receptionist/appointments',
        element: (
            <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
                <ReceptionistLayout>
                    <ReceptionistAppointments />
                </ReceptionistLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/receptionist/re-examination',
        element: (
            <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
                <ReceptionistLayout>
                    <ReBooking />
                </ReceptionistLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/receptionist/invoices',
        element: (
            <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
                <ReceptionistLayout>
                    <ReceptionistInvoices />
                </ReceptionistLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/receptionist/booking',
        element: (
            <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
                <ReceptionistLayout>
                    <Booking />
                </ReceptionistLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/receptionist/services',
        element: (
            <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
                <ReceptionistLayout>
                    <ReceptionistServices />
                </ReceptionistLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/receptionist/sub-services/:parentId',
        element: (
            <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
                <ReceptionistLayout>
                    <ReceptionistSubServices />
                </ReceptionistLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/receptionist/equipment',
        element: (
            <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
                <ReceptionistLayout>
                    <ReceptionistEquipment />
                </ReceptionistLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/receptionist/leave',
        element: (
            <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
                <ReceptionistLayout>
                    <ReceptionistLeave />
                </ReceptionistLayout>
            </ProtectedRoute>
        )
    }
];

export default receptionistRoutes;
