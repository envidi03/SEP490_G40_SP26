import { useAuth } from '../../contexts/AuthContext';
import AdminClinicDashboard from '../dashboard/AdminClinicDashboard';
import DoctorDashboard from '../dashboard/DoctorDashboard';
import ReceptionistDashboard from '../dashboard/ReceptionistDashboard';

/**
 * DashboardRoute - Component điều hướng dashboard theo role
 * Render dashboard tương ứng với role của user
 * 
 * @component
 */
const DashboardRoute = () => {
    const { user } = useAuth();

    // Render dashboard based on role
    if (user?.role === 'Admin') {
        return <AdminClinicDashboard />;
    } else if (user?.role === 'Doctor') {
        return <DoctorDashboard />;
    } else if (user?.role === 'Receptionist') {
        return <ReceptionistDashboard />;
    }

    // Default fallback for unknown roles
    return <AdminClinicDashboard />;
};

export default DashboardRoute;
