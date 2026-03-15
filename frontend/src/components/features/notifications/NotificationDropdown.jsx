import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, CheckCheck, Bell, MessageSquare, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import NotificationItem from './NotificationItem';

const NotificationDropdown = ({ onClose }) => {
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const [activeTab, setActiveTab] = useState('all');
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mock data (sync with page for now)
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
            }
        ];
        
        const timer = setTimeout(() => {
            setNotifications(mockData);
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
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
                    <button className="p-2 hover:bg-gray-100 rounded-xl text-primary-600 transition-colors" title="Đánh dấu tất cả đã đọc">
                        <CheckCheck size={18} />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex px-4 py-2 border-b border-gray-50 bg-gray-50/30">
                <button 
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        activeTab === 'all' 
                        ? 'bg-white text-primary-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Tất cả
                </button>
                <button 
                    onClick={() => setActiveTab('unread')}
                    className={`ml-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        activeTab === 'unread' 
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
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    </div>
                ) : filtered.length > 0 ? (
                    filtered.map(notification => (
                        <NotificationItem 
                            key={notification.id}
                            notification={notification}
                            isCompact={true}
                            onToggleRead={() => {}} 
                            onDelete={() => {}}
                        />
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
