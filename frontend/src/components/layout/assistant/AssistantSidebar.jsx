import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    FileText,
    Clock,
    LogOut,
    AlignLeft
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../../contexts/AuthContext';


const AssistantSidebar = () => {
    const location = useLocation();
    const { logout, user } = useAuth();

    const menuItems = [
        { path: '/assistant/dashboard', icon: LayoutDashboard, label: 'Tổng Quan' },
        { path: '/assistant/appointments', icon: Calendar, label: 'Lịch Khám' },
        { path: '/assistant/medical-records', icon: FileText, label: 'Hồ Sơ' },
        { path: '/assistant/leave-requests', icon: Clock, label: 'Nghỉ Phép' },
    ];

    return (
        <div className="fixed left-4 top-4 bottom-4 w-72 bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] flex flex-col z-50 overflow-hidden transition-all duration-300">
            {/* Header */}
            <div className="p-8 pb-4">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30">
                        A
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">
                        Assistant
                    </span>
                </div>
                <p className="text-xs text-gray-400 pl-11 font-medium tracking-wide uppercase">Dental Clinic</p>
            </div>

            {/* User Profile Card - Compact */}
            <Link to="/assistant/profile" className="block mx-6 mb-6 group">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100/50 transition-all duration-200 group-hover:shadow-md group-hover:border-blue-200 group-hover:from-blue-50 group-hover:to-blue-100/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-blue-600 font-bold border border-blue-50 text-sm">
                            {user?.full_name ? user.full_name.charAt(0) : 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-800 truncate group-hover:text-blue-700 transition-colors">
                                {user?.full_name || 'User'}
                            </p>
                            <p className="text-xs text-blue-600 font-medium truncate">
                                Trợ lý nha khoa
                            </p>
                        </div>
                    </div>
                </div>
            </Link>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-2">Menu</p>
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                'flex items-center px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-200 group relative overflow-hidden',
                                isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 translate-x-1'
                                    : 'text-gray-500 hover:bg-white hover:text-blue-600 hover:shadow-md hover:shadow-gray-200/50'
                            )}
                        >
                            {isActive && (
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-blue-500 opacity-100 z-[-1]" />
                            )}
                            <Icon
                                size={20}
                                className={clsx(
                                    "mr-3 transition-transform duration-200",
                                    isActive ? "scale-110" : "group-hover:scale-110"
                                )}
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                            <span>{item.label}</span>

                            {isActive && (
                                <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 mt-auto">
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 border border-transparent hover:border-red-100"
                >
                    <LogOut size={18} />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </div>
    );
};

export default AssistantSidebar;
