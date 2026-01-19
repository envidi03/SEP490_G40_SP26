import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedRoute from './guards/ProtectedRoute';
import LeaveRequestList from '../pages/leave_requests/LeaveRequestList';

// Leave Request routes
const leavereqRoutes = [
    {
        path: '/leave-requests',
        element: (
            <ProtectedRoute>
                <DashboardLayout>
                    <LeaveRequestList />
                </DashboardLayout>
            </ProtectedRoute>
        )
    }
];

export default leavereqRoutes;
