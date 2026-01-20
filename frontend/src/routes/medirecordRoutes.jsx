import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedRoute from './guards/ProtectedRoute';
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
    }
];

export default medirecordRoutes;
