import React from 'react';
import NotificationsPage from '../../pages/notifications/NotificationsPage';
import ProtectedRoute from '../guards/ProtectedRoute';
import RoleBasedLayout from '../../components/layout/RoleBasedLayout';

const notificationRoutes = [
  {
    path: '/notifications',
    element: (
      <ProtectedRoute>
        <RoleBasedLayout>
          <NotificationsPage />
        </RoleBasedLayout>
      </ProtectedRoute>
    )
  }
];

export default notificationRoutes;
