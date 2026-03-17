import React, { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCheck, Trash2, Search, MessageSquare, AlertTriangle, Info, CheckCircle2, Clock } from 'lucide-react';
import SharedPagination from '../../components/ui/SharedPagination';
import NotificationItem from '../../components/features/notifications/NotificationItem';
import notificationService from '../../services/notificationService';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';

const NotificationsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Detail Modal State
    const [selectedNotification, setSelectedNotification] = useState(null);

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState({
        show: false,
        title: '',
        message: '',
        onConfirm: null,
        isLoading: false
    });

    const getNotificationStyle = (type) => {
        switch (type) {
            case 'NEW_APPOINTMENT':
            case 'PATIENT_CHECKED_IN':
                return { icon: Info, iconClass: 'bg-indigo-100 text-indigo-600', category: 'work' };
            case 'APPOINTMENT_CANCELLED':
            case 'SYSTEM_ALERT':
                return { icon: AlertTriangle, iconClass: 'bg-amber-100 text-amber-600', category: 'system' };
            case 'INVOICE_READY':
            case 'NEW_PRESCRIPTION':
                return { icon: MessageSquare, iconClass: 'bg-blue-100 text-blue-600', category: 'work' };
            case 'LOW_STOCK':
            case 'EXPIRING_MEDICINE':
                return { icon: AlertTriangle, iconClass: 'bg-red-100 text-red-600', category: 'work' };
            case 'SYSTEM_MAINTENANCE':
                return { icon: Info, iconClass: 'bg-gray-100 text-gray-600', category: 'system' };
            default:
                return { icon: Bell, iconClass: 'bg-gray-100 text-gray-600', category: 'system' };
        }
    };

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const response = await notificationService.getNotifications(currentPage, 10);
            if (response.status === 'success') {
                const mappedData = response.data.map(notif => {
                    const style = getNotificationStyle(notif.type);
                    return {
                        id: notif._id,
                        type: style.category,
                        title: notif.title,
                        content: notif.message,
                        time: formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: vi }),
                        isRead: notif.is_read,
                        icon: style.icon,
                        iconClass: style.iconClass
                    };
                });
                setNotifications(mappedData);
                setTotalPages(response.pagination.totalPages);
                setTotalItems(response.pagination.total);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Không thể tải danh sách thông báo');
        } finally {
            setLoading(false);
        }
    }, [currentPage]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Handle auto-open detail if navigated from dropdown
    useEffect(() => {
        if (location.state?.openNotification) {
            const notif = location.state.openNotification;
            setSelectedNotification(notif);
            
            // Mark as read if it was unread
            if (!notif.isRead) {
                notificationService.markAsRead(notif.id)
                    .then(response => {
                        if (response.status === 'success') {
                            setNotifications(prev => prev.map(n => 
                                n.id === notif.id ? { ...n, isRead: true } : n
                            ));
                            window.dispatchEvent(new CustomEvent('notificationsUpdated'));
                        }
                    })
                    .catch(err => console.error('Error marking as read from state:', err));
            }

            // Clear state to avoid reopening on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const filteredNotifications = notifications.filter(n => {
        const matchesTab = activeTab === 'all' || (activeTab === 'unread' ? !n.isRead : n.type === activeTab);
        const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            n.content.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const handleMarkAllAsRead = async () => {
        try {
            const response = await notificationService.markAllAsRead();
            if (response.status === 'success') {
                setNotifications(notifications.map(n => ({ ...n, isRead: true })));
                toast.success('Đã đánh dấu tất cả là đã đọc');
                window.dispatchEvent(new CustomEvent('notificationsUpdated'));
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra khi thực hiện');
        }
    };

    const handleDeleteAllRead = () => {
        setConfirmModal({
            show: true,
            title: 'Xóa tất cả thông báo đã đọc',
            message: 'Bạn có chắc chắn muốn xóa tất cả thông báo đã đọc? Hành động này không thể hoàn tác.',
            onConfirm: performDeleteAllRead,
            isLoading: false
        });
    };

    const performDeleteAllRead = async () => {
        setConfirmModal(prev => ({ ...prev, isLoading: true }));
        try {
            const response = await notificationService.deleteAllRead();
            if (response.status === 'success') {
                fetchNotifications();
                toast.success('Đã xóa các thông báo đã đọc');
                window.dispatchEvent(new CustomEvent('notificationsUpdated'));
            }
        } catch (error) {
            toast.error('Không thể xóa thông báo');
        } finally {
            setConfirmModal({ show: false, title: '', message: '', onConfirm: null, isLoading: false });
        }
    };

    const toggleRead = async (id) => {
        const notif = notifications.find(n => n.id === id);
        if (!notif) return;

        try {
            const response = await notificationService.toggleReadStatus(id);
            if (response.status === 'success') {
                setNotifications(notifications.map(n =>
                    n.id === id ? { ...n, isRead: !n.isRead } : n
                ));
                // Notify other components to refresh (like NotificationBell)
                window.dispatchEvent(new CustomEvent('notificationsUpdated'));
            }
        } catch (error) {
            console.error(error);
            toast.error('Lỗi khi cập nhật trạng thái');
        }
    };

    const handleNotificationClick = async (notif) => {
        setSelectedNotification(notif);
        if (!notif.isRead) {
            try {
                await notificationService.markAsRead(notif.id);
                setNotifications(notifications.map(n =>
                    n.id === notif.id ? { ...n, isRead: true } : n
                ));
                window.dispatchEvent(new CustomEvent('notificationsUpdated'));
            } catch (error) {
                console.error('Error marking as read on click:', error);
            }
        }
    };

    const deleteNotification = (id) => {
        setConfirmModal({
            show: true,
            title: 'Xác nhận xóa',
            message: 'Bạn có chắc chắn muốn xóa thông báo này?',
            onConfirm: () => performDeleteNotification(id),
            isLoading: false
        });
    };

    const performDeleteNotification = async (id) => {
        setConfirmModal(prev => ({ ...prev, isLoading: true }));
        try {
            const response = await notificationService.deleteNotification(id);
            if (response.status === 'success') {
                setNotifications(notifications.filter(n => n.id !== id));
                toast.success('Đã xóa thông báo');
                window.dispatchEvent(new CustomEvent('notificationsUpdated'));
            }
        } catch (error) {
            toast.error('Lỗi khi xóa thông báo');
        } finally {
            setConfirmModal({ show: false, title: '', message: '', onConfirm: null, isLoading: false });
        }
    };

    const tabs = [
        { id: 'all', label: 'Tất cả' },
        { id: 'unread', label: 'Chưa đọc' },
        { id: 'work', label: 'Công việc' },
        { id: 'system', label: 'Hệ thống' }
    ];

    return (
        <div className="max-w-4xl mx-auto pt-16 pb-8 px-4">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Bell className="text-primary-600" />
                        Thông báo
                    </h1>
                    <p className="text-gray-500 mt-1">Cập nhật những hoạt động mới nhất của bạn</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleMarkAllAsRead}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all hover:shadow-sm"
                    >
                        <CheckCheck size={16} className="text-green-500" />
                        Đánh dấu tất cả đã đọc
                    </button>
                    <button
                        onClick={handleDeleteAllRead}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all hover:shadow-sm"
                    >
                        <Trash2 size={16} />
                        Xóa thông báo đã đọc
                    </button>
                </div>
            </div>

            {/* Filters and Tabs */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm mb-6 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex bg-gray-100/50 p-1 rounded-xl">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                        ? 'bg-white text-primary-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab.label}
                                {tab.id === 'unread' && notifications.filter(n => !n.isRead).length > 0 && (
                                    <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px]">
                                        {notifications.filter(n => !n.isRead).length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm thông báo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl w-full md:w-64 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Notifications List */}
                <div className="divide-y divide-gray-100">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div>
                            <p className="mt-4 text-gray-500">Đang tải thông báo...</p>
                        </div>
                    ) : filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onToggleRead={toggleRead}
                                onDelete={deleteNotification}
                                onClick={handleNotificationClick}
                            />
                        ))
                    ) : (
                        <div className="p-16 text-center">
                            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bell className="text-gray-300" size={32} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Không có thông báo nào</h3>
                            <p className="text-gray-500 mt-1 max-w-xs mx-auto">
                                Khi có hoạt động mới, chúng tôi sẽ hiển thị thông báo ở đây.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Pagination Component */}
            {!loading && filteredNotifications.length > 0 && (
                <SharedPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    onPageChange={(page) => setCurrentPage(page)}
                    itemLabel="thông báo"
                />
            )}

            <ConfirmationModal
                show={confirmModal.show}
                onClose={() => setConfirmModal(prev => ({ ...prev, show: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                isLoading={confirmModal.isLoading}
                confirmText={confirmModal.isLoading ? 'Đang xử lý...' : 'Xác nhận'}
            />

            {/* Notification Detail Modal */}
            <Modal
                isOpen={!!selectedNotification}
                onClose={() => setSelectedNotification(null)}
                title="Chi tiết thông báo"
                size="md"
                footer={(
                    <div className="flex gap-3 justify-end">
                        <Button 
                            variant="outline" 
                            onClick={() => setSelectedNotification(null)}
                        >
                            Đóng
                        </Button>
                        {selectedNotification?.actionUrl && (
                            <Button 
                                onClick={() => {
                                    navigate(selectedNotification.actionUrl);
                                    setSelectedNotification(null);
                                }}
                            >
                                Đi đến trang liên quan
                            </Button>
                        )}
                    </div>
                )}
            >
                {selectedNotification && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                            <div className={`p-3 rounded-2xl ${selectedNotification.iconClass}`}>
                                <selectedNotification.icon size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-lg">{selectedNotification.title}</h4>
                                <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                                    <Clock size={12} />
                                    {selectedNotification.time}
                                </div>
                            </div>
                        </div>
                        <div className="py-4">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: selectedNotification.content }}>
                            </p>
                        </div>
                        {selectedNotification.actionUrl && (
                            <div className="p-4 bg-primary-50 rounded-xl border border-primary-100">
                                <p className="text-xs text-primary-700 font-medium">
                                    Thao tác đề xuất:
                                </p>
                                <p className="text-sm text-primary-800 mt-1">
                                    Bạn có thể xem chi tiết nội dung liên quan bằng cách nhấn nút dưới đây.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default NotificationsPage;
