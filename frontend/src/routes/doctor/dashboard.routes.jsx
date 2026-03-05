// Export doctor dashboard routes
import DashboardLayout from '../../components/layout/DashboardLayout';
import ProtectedRoute from '../guards/ProtectedRoute';
import DoctorDashboard from '../../pages/dashboard/DoctorDashboard';
import DentistAppointmentList from '../../pages/appointments/DentistAppointmentList';
import DentistPatientList from '../../pages/patients/DentistPatientList';
import LeaveRequestList from '../../pages/leave_requests/LeaveRequestList';
import MedicalRecordList from '../../pages/medical_records/MedicalRecordList';
import DentalRecordApprovalList from '../../pages/medical_records/DentalRecordApprovalList';
import AssistantLeaveRequests from '../../pages/leave_requests/AssistantLeaveRequests/AssistantLeaveRequests';
import DentalRecordList from '../../pages/medical_records/DentalRecordList';
import DentalRecordDetail from '../../pages/medical_records/DentalRecordDetail';
import TreatmentList from '../../pages/treatments/TreatmentList';
import TreatmentApproval from '../../pages/treatments/TreatmentApproval';

const dashboardRoutes = [
    {
        path: '/dentist/dashboard',
        element: (
            <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DashboardLayout>
                    <DoctorDashboard />
                </DashboardLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/dentist/schedule',
        element: (
            <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DashboardLayout>
                    <DentistAppointmentList />
                </DashboardLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/dentist/patients',
        element: (
            <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DashboardLayout>
                    <DentistPatientList />
                </DashboardLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/dentist/leave-requests',
        element: (
            <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DashboardLayout>
                    <LeaveRequestList />
                </DashboardLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/dentist/medical-records',
        element: (
            <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DashboardLayout>
                    <MedicalRecordList />
                </DashboardLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/dentist/medical-record-approvals',
        element: (
            <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DashboardLayout>
                    <DentalRecordApprovalList />
                </DashboardLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/dentist/assistant-leave-requests',
        element: (
            <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DashboardLayout>
                    <AssistantLeaveRequests />
                </DashboardLayout>
            </ProtectedRoute>
        )
    },
    // ── New dental record routes ──
    {
        path: '/dentist/dental-records',
        element: (
            <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DashboardLayout>
                    <DentalRecordList />
                </DashboardLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/dentist/dental-records/:id',
        element: (
            <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DashboardLayout>
                    <DentalRecordDetail />
                </DashboardLayout>
            </ProtectedRoute>
        )
    },
    // ── Treatment management routes ──
    {
        path: '/dentist/treatments',
        element: (
            <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DashboardLayout>
                    <TreatmentList />
                </DashboardLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/dentist/treatment-approvals',
        element: (
            <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DashboardLayout>
                    <TreatmentApproval />
                </DashboardLayout>
            </ProtectedRoute>
        )
    },
];

export default dashboardRoutes;
