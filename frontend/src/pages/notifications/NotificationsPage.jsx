import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, Search } from 'lucide-react';
import SharedPagination from '../../components/ui/SharedPagination';
import NotificationItem from '../../components/features/notifications/NotificationItem';
import { MessageSquare, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

const NotificationsPage = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Mock data for demonstration
    useEffect(() => {
        const mockData = [
            {
                id: 1,
                type: 'work',
                title: 'Duyệt đơn thuốc',
                content: 'Bác sĩ **Nguyễn Văn A** vừa gửi một đơn thuốc mới cần bạn xác nhận.',
                time: '2 phút trước',
                isRead: false,
                icon: MessageSquare,
                iconClass: 'bg-blue-100 text-blue-600'
            },
            {
                id: 2,
                type: 'system',
                title: 'Bảo trì hệ thống',
                content: 'Hệ thống sẽ được bảo trì vào lúc 23:00 tối nay. Vui lòng lưu lại công việc.',
                time: '1 giờ trước',
                isRead: false,
                icon: AlertTriangle,
                iconClass: 'bg-amber-100 text-amber-600'
            },
            {
                id: 3,
                type: 'work',
                title: 'Lịch hẹn mới',
                content: 'Bệnh nhân **Lê Thị B** đã đặt lịch hẹn khám răng vào ngày mai.',
                time: '3 giờ trước',
                isRead: true,
                icon: Info,
                iconClass: 'bg-indigo-100 text-indigo-600'
            },
            {
                id: 4,
                type: 'system',
                title: 'Thanh toán thành công',
                content: 'Hóa đơn #INV-2024-001 đã được thanh toán đầy đủ.',
                time: '5 giờ trước',
                isRead: true,
                icon: CheckCircle2,
                iconClass: 'bg-green-100 text-green-600'
            },
            {
                id: 5,
                type: 'work',
                title: 'Yêu cầu nghỉ phép',
                content: 'Yêu cầu nghỉ phép của bạn đã được **Admin** phê duyệt.',
                time: '1 ngày trước',
                isRead: true,
                icon: CheckCircle2,
                iconClass: 'bg-green-100 text-green-600'
            }
        ];

        // Simulate API call
        const timer = setTimeout(() => {
            setNotifications(mockData);
            setLoading(false);
            setTotalPages(1);
        }, 800);

        return () => clearTimeout(timer);
    }, []);

    const filteredNotifications = notifications.filter(n => {
        const matchesTab = activeTab === 'all' || (activeTab === 'unread' ? !n.isRead : n.type === activeTab);
        const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             n.content.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    };

    const clearAll = () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa tất cả thông báo?')) {
            setNotifications([]);
        }
    };

    const toggleRead = (id) => {
        setNotifications(notifications.map(n => 
            n.id === id ? { ...n, isRead: !n.isRead } : n
        ));
    };

    const deleteNotification = (id) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    const tabs = [
        { id: 'all', label: 'Tất cả' },
        { id: 'unread', label: 'Chưa đọc' },
        { id: 'work', label: 'Công việc' },
        { id: 'system', label: 'Hệ thống' }
    ];

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
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
                        onClick={markAllAsRead}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all hover:shadow-sm"
                    >
                        <CheckCheck size={16} className="text-green-500" />
                        Đánh dấu tất cả đã đọc
                    </button>
                    <button 
                        onClick={clearAll}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all hover:shadow-sm"
                    >
                        <Trash2 size={16} />
                        Xóa tất cả
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
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    activeTab === tab.id 
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
                    totalItems={filteredNotifications.length}
                    onPageChange={(page) => setCurrentPage(page)}
                    itemLabel="thông báo"
                />
            )}
        </div>
    );
};

export default NotificationsPage;
