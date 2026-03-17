import apiClient from './api';

const notificationService = {
    getNotifications: (page = 1, limit = 20) => {
        return apiClient.get('/api/notification', { params: { page, limit } });
    },
    getUnreadCount: () => {
        return apiClient.get('/api/notification/unread-count');
    },
    markAsRead: (id) => {
        return apiClient.put(`/api/notification/${id}/read`);
    },
    toggleReadStatus: (id) => {
        return apiClient.put(`/api/notification/${id}/toggle-read`);
    },
    markAllAsRead: () => {
        return apiClient.put('/api/notification/read-all');
    },
    markAsSeen: (id) => {
        return apiClient.put(`/api/notification/${id}/seen`);
    },
    deleteNotification: (id) => {
        return apiClient.delete(`/api/notification/${id}`);
    },
    deleteAllRead: () => {
        return apiClient.delete('/api/notification/read-all');
    }
};

export default notificationService;
