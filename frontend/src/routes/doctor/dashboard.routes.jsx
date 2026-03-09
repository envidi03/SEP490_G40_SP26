// Export doctor dashboard routes
import DentistDashboardLayout from '../../components/layout/dentist/DentistDashboardLayout';
import ProtectedRoute from '../guards/ProtectedRoute';
import DoctorDashboard from '../../pages/dashboard/DoctorDashboard';
import DentistAppointmentList from '../../pages/appointments/DentistAppointmentList';
import DentistPatientList from '../../pages/patients/DentistPatientList';
import LeaveRequestList from '../../pages/leave_requests/LeaveRequestList';
import DentalRecordDetail from '../../pages/medical_records/DentalRecordDetail';
import PatientRecordSearch from '../../pages/medical_records/PatientRecordSearch';
import TreatmentList from '../../pages/treatments/TreatmentList';
import TreatmentApproval from '../../pages/treatments/TreatmentApproval';

const dashboardRoutes = [
    {
        path: '/dentist/dashboard',
        element: (
            <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DentistDashboardLayout>
                    <DoctorDashboard />
                </DentistDashboardLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/dentist/schedule',
        element: (
            <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DentistDashboardLayout>
                    <DentistAppointmentList />
                </DentistDashboardLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/dentist/patients',
        element: (
            <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DentistDashboardLayout>
                    <DentistPatientList />
                </DentistDashboardLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/dentist/leave-requests',
        element: (
            <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DentistDashboardLayout>
                    <LeaveRequestList />
                </DentistDashboardLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/dentist/dental-records/search',
        element: (
            <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DentistDashboardLayout>
                    <PatientRecordSearch />
                </DentistDashboardLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/dentist/dental-records/:id',
        element: (
            <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DentistDashboardLayout>
                    <DentalRecordDetail />
                </DentistDashboardLayout>
            </ProtectedRoute>
        )
    },
    // ── Treatment management routes ──
    {
        path: '/dentist/treatments',
        element: (
            <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DentistDashboardLayout>
                    <TreatmentList />
                </DentistDashboardLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/dentist/treatment-approvals',
        element: (
            <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DentistDashboardLayout>
                    <TreatmentApproval />
                </DentistDashboardLayout>
            </ProtectedRoute>
        )
    },
];

export default dashboardRoutes;
