import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import RoleBasedRoute from '../guards/RoleBasedRoute';
import AdminRestockList from '../../pages/admin/restock_requests/AdminRestockList';

const restockRoutes = {
    path: '/admin/restock-requests',
    element: (
        <RoleBasedRoute allowedRoles={['ADMIN_CLINIC']}>
            <DashboardLayout>
                <AdminRestockList />
            </DashboardLayout>
        </RoleBasedRoute>
    )
};

export default restockRoutes;
