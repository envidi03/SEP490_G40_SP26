import React from 'react';
import NotificationsPage from '../../pages/notifications/NotificationsPage';
import ProtectedRoute from '../guards/ProtectedRoute';

const notificationRoutes = [
  {
    path: '/notifications',
    element: (
      <ProtectedRoute>
        <NotificationsPage />
      </ProtectedRoute>
    )
  }
];

export default notificationRoutes;
