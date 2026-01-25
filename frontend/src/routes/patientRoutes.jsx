import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedRoute from './guards/ProtectedRoute';
import PatientDetail from '../pages/patients/PatientDetail';
import MedicalRecords from '../pages/patients/MedicalRecords';
import DentistPatientList from '../pages/patients/DentistPatientList';
import PatientList from '../pages/patients/PatientList';

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
        path: '/dentist-patients',
        element: (
            <ProtectedRoute>
                <DashboardLayout>
                    <DentistPatientList />
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
