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
    },
    {
        path: '/dentist/approvals',
        element: (
            <ProtectedRoute>
                <DashboardLayout>
                    <MedicalRecordApproval />
                </DashboardLayout>
            </ProtectedRoute>
        )
    },
    {
        path: '/dentist/approvals/:id',
        element: (
            <ProtectedRoute>
                <DashboardLayout>
                    <MedicalRecordApprovalDetail />
                </DashboardLayout>
            </ProtectedRoute>
        )
    }
];

export default medirecordRoutes;
