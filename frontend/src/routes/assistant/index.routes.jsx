import AssistantLayout from '../../components/layout/AssistantLayout';
import ProtectedRoute from '../guards/ProtectedRoute';
import AssistantAppointments from '../../pages/assistant/AssistantAppointments';


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
    }
];

export default assistantRoutes;
