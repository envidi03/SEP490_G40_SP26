import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedRoute from './guards/ProtectedRoute';
import PatientList from '../pages/patients/PatientList';
import PatientDetail from '../pages/patients/PatientDetail';
import MedicalRecords from '../pages/patients/MedicalRecords';

// Patient management routes
const patientRoutes = [
    {
        path: '/patients',
        element: (
            <ProtectedRoute>
                <DashboardLayout>
                    <PatientList />
                </DashboardLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/patients/:id',
        element: (
            <ProtectedRoute>
                <DashboardLayout>
                    <PatientDetail />
                </DashboardLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/patients/:id/records',
        element: (
            <ProtectedRoute>
                <DashboardLayout>
                    <MedicalRecords />
                </DashboardLayout>
            </ProtectedRoute>
        )
    }
];

export default patientRoutes;
