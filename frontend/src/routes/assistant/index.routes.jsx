import AssistantLayout from '../../components/layout/assistant/AssistantLayout';
import ProtectedRoute from '../guards/ProtectedRoute';
import AssistantAppointments from '../../pages/assistant/AssistantAppointments';
import AssistantMedicalRecords from '../../pages/assistant/AssistantMedicalRecords';
import AssistantLeaveRequests from '../../pages/assistant/AssistantLeaveRequests';

/**
 * Assistant Routes - Role-specific routes for Dental Assistant
 * All routes protected with Assistant role requirement
 * Note: Profile route is defined in shared/profile.routes.jsx
 */
const assistantRoutes = [
    {
        path: '/assistant/appointments',
        element: (
            <ProtectedRoute allowedRoles={['ASSISTANT']}>
                <AssistantLayout>
                    <AssistantAppointments />
                </AssistantLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/assistant/medical-records',
        element: (
            <ProtectedRoute allowedRoles={['ASSISTANT']}>
                <AssistantLayout>
                    <AssistantMedicalRecords />
                </AssistantLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/assistant/leave-requests',
        element: (
            <ProtectedRoute allowedRoles={['ASSISTANT']}>
                <AssistantLayout>
                    <AssistantLeaveRequests />
                </AssistantLayout>
            </ProtectedRoute>
        )
    }
];

export default assistantRoutes;
