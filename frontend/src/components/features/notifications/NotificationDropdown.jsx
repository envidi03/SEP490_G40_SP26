import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, CheckCheck, Bell, MessageSquare, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import NotificationItem from './NotificationItem';
import notificationService from '../../../services/notificationService';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const NotificationDropdown = ({ onClose, onRefreshCount }) => {
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const [activeTab, setActiveTab] = useState('all');
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mapper for icon and iconClass based on notification type
    const getNotificationStyle = (type) => {
        switch (type) {
            case 'NEW_APPOINTMENT':
            case 'PATIENT_CHECKED_IN':
                return { icon: Info, iconClass: 'bg-indigo-100 text-indigo-600' };
            case 'APPOINTMENT_CANCELLED':
            case 'SYSTEM_ALERT':
                return { icon: AlertTriangle, iconClass: 'bg-amber-100 text-amber-600' };
            case 'INVOICE_READY':
            case 'NEW_PRESCRIPTION':
                return { icon: MessageSquare, iconClass: 'bg-blue-100 text-blue-600' };
            case 'LOW_STOCK':
            case 'EXPIRING_MEDICINE':
                return { icon: AlertTriangle, iconClass: 'bg-red-100 text-red-600' };
            default:
                return { icon: Bell, iconClass: 'bg-gray-100 text-gray-600' };
        }
    };

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await notificationService.getNotifications(1, 10);
            if (response.status === 'success') {
                const mappedData = response.data.map(notif => {
                    const style = getNotificationStyle(notif.type);
                    return {
                        id: notif._id,
                        title: notif.title,
                        content: notif.message,
                        time: formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: vi }),
                        isRead: notif.is_read,
                        icon: style.icon,
                        iconClass: style.iconClass,
                        _raw: notif // Keep raw data if needed
                    };
                });
                setNotifications(mappedData);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const filtered = notifications.filter(n => {
        if (activeTab === 'unread') return !n.isRead;
        return true;
    });

    const handleViewAll = () => {
        navigate('/notifications');
        onClose();
    };

    const handleMarkAllAsRead = async () => {
        try {
            const response = await notificationService.markAllAsRead();
            if (response.status === 'success') {
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                if (onRefreshCount) onRefreshCount();
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleNotificationClick = (notif) => {
        navigate('/notifications', { state: { openNotification: notif } });
        onClose();
    };

    const handleMarkAsRead = async (id) => {
        try {
            const response = await notificationService.markAsRead(id);
            if (response.status === 'success') {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
                if (onRefreshCount) onRefreshCount();
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    return (
        <div
            ref={dropdownRef}
            className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 overflow-hidden z-50 animate-in fade-in zoom-in duration-200 origin-top-right scale-100"
        >
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white/50">
                <h3 className="text-lg font-bold text-gray-900">Thông báo</h3>
                <div className="flex items-center gap-1">
                    <button className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors" title="Cài đặt">
                        <Settings size={18} />
                    </button>
                    <button
                        onClick={handleMarkAllAsRead}
                        className="p-2 hover:bg-gray-100 rounded-xl text-primary-600 transition-colors"
                        title="Đánh dấu tất cả đã đọc"
                    >
                        <CheckCheck size={18} />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex px-4 py-2 border-b border-gray-50 bg-gray-50/30">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'all'
                            ? 'bg-white text-primary-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Tất cả
                </button>
                <button
                    onClick={() => setActiveTab('unread')}
                    className={`ml-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'unread'
                            ? 'bg-white text-primary-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Chưa đọc
                    {notifications.some(n => !n.isRead) && (
                        <span className="ml-1.5 w-2 h-2 bg-red-500 rounded-full inline-block"></span>
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="max-h-[min(400px,70vh)] overflow-y-auto overscroll-contain divide-y divide-gray-50 custom-scrollbar">
                {loading && notifications.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    </div>
                ) : filtered.length > 0 ? (
                    filtered.map(notification => (
                        <div key={notification.id} onClick={() => handleNotificationClick(notification)}>
                            <NotificationItem
                                notification={notification}
                                isCompact={true}
                                onToggleRead={() => handleMarkAsRead(notification.id)}
                                onDelete={() => { }}
                            />
                        </div>
                    ))
                ) : (
                    <div className="p-12 text-center">
                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Bell className="text-gray-300" size={28} />
                        </div>
                        <p className="text-sm font-medium text-gray-900">Hết thông báo rồi!</p>
                        <p className="text-xs text-gray-500 mt-1">Bạn đã cập nhật mọi thứ.</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <button
                onClick={handleViewAll}
                className="w-full p-3 text-center text-sm font-bold text-primary-600 hover:bg-primary-50 transition-colors border-t border-gray-100 bg-white/50"
            >
                Xem tất cả thông báo
            </button>
        </div>
    );
};

export default NotificationDropdown;
