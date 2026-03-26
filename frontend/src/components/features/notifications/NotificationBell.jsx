import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import notificationService from '../../../services/notificationService';
import { useSocket } from '../../../contexts/SocketContext';
import { useAuth } from '../../../contexts/AuthContext';

import { toast } from 'react-hot-toast';

const NotificationBell = () => {
    const { isAuthenticated } = useAuth();
    const { socket } = useSocket();
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = async () => {
        try {
            const response = await notificationService.getUnreadCount();
            if (response.status === 'success') {
                setUnreadCount(response.data.unread_count);
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchUnreadCount();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        const handleUpdate = () => {
            fetchUnreadCount();
        };

        window.addEventListener('notificationsUpdated', handleUpdate);
        return () => {
            window.removeEventListener('notificationsUpdated', handleUpdate);
        };
    }, []);

    useEffect(() => {
        if (socket) {
            socket.on('new_notification', (notification) => {
                setUnreadCount(prev => prev + 1);
                // Hiển thị toast thông báo tức thời
                toast.success(`${notification.title}: ${notification.message}`, {
                    duration: 5000,
                    icon: '🔔',
                });
            });

            return () => {
                socket.off('new_notification');
            };
        }
    }, [socket]);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2.5 rounded-2xl transition-all duration-300 relative group ${isOpen
                    ? 'bg-primary-50 text-primary-600 shadow-inner'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                    }`}
            >
                <Bell
                    size={22}
                    className={`transition-transform duration-300 ${isOpen ? 'scale-110' : 'group-hover:rotate-12'}`}
                />

                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] text-white font-bold items-center justify-center">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    </span>
                )}
            </button>

            {isOpen && (
                <NotificationDropdown
                    onClose={() => setIsOpen(false)}
                    onRefreshCount={fetchUnreadCount}
                />
            )}
        </div>
    );
};

export default NotificationBell;
