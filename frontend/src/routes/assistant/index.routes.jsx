import AssistantLayout from '../../components/layout/assistant/AssistantLayout';
import ProtectedRoute from '../guards/ProtectedRoute';
import AssistantAppointments from '../../pages/assistant/AssistantAppointments';
import AssistantMedicalRecords from '../../pages/assistant/AssistantMedicalRecords';
import AssistantLeaveRequests from '../../pages/assistant/AssistantLeaveRequests';
import AssistantTreatmentPlans from '../../pages/assistant/AssistantTreatmentPlans';
import AssistantPrescriptions from '../../pages/assistant/AssistantPrescriptions';
import AssistantEquipment from '../../pages/assistant/AssistantEquipment';

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
        path: '/assistant/treatment-plans',
        element: (
            <ProtectedRoute allowedRoles={['ASSISTANT']}>
                <AssistantLayout>
                    <AssistantTreatmentPlans />
                </AssistantLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/assistant/prescriptions',
        element: (
            <ProtectedRoute allowedRoles={['ASSISTANT']}>
                <AssistantLayout>
                    <AssistantPrescriptions />
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
    },
    {
        path: '/assistant/equipment',
        element: (
            <ProtectedRoute allowedRoles={['ASSISTANT']}>
                <AssistantLayout>
                    <AssistantEquipment />
                </AssistantLayout>
            </ProtectedRoute>
        )
    }
];

export default assistantRoutes;

