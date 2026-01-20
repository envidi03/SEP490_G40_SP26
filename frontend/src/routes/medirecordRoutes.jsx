import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedRoute from './guards/ProtectedRoute';
import CreateRecord from '../pages/medical_records/CreateRecord';
import MedicalRecordList from '../pages/medical_records/MedicalRecordList';

// Medical Record routes
const medirecordRoutes = [
    {
        path: '/dentist/medical-records',
        element: (
            <ProtectedRoute>
                <DashboardLayout>
                    <MedicalRecordList />
                </DashboardLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/dentist/patients/:id/create-record',
        element: (
            <ProtectedRoute>
                <DashboardLayout>
                    <CreateRecord />
                </DashboardLayout>
            </ProtectedRoute>
        )
    }
];

export default medirecordRoutes;
