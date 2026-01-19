import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedRoute from './guards/ProtectedRoute';
import AppointmentList from '../pages/appointments/AppointmentList';
import AppointmentForm from '../pages/appointments/AppointmentForm';
import AppointmentCalendar from '../pages/appointments/AppointmentCalendar';

// Appointment management routes
const appointmentRoutes = [
    {
        path: '/appointments',
        element: (
            <ProtectedRoute>
                <DashboardLayout>
                    <AppointmentList />
                </DashboardLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/appointments/new',
        element: (
            <ProtectedRoute>
                <DashboardLayout>
                    <AppointmentForm />
                </DashboardLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/appointments/:id/edit',
        element: (
            <ProtectedRoute>
                <DashboardLayout>
                    <AppointmentForm />
                </DashboardLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/appointments/calendar',
        element: (
            <ProtectedRoute>
                <DashboardLayout>
                    <AppointmentCalendar />
                </DashboardLayout>
            </ProtectedRoute>
        )
    }
];

export default appointmentRoutes;
