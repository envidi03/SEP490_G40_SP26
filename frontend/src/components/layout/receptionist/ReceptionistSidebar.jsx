import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Calendar,
    DollarSign,
    ClipboardList,
    Wrench,
    LogOut,
    Menu
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../../contexts/AuthContext';

const ReceptionistSidebar = () => {
    const location = useLocation();
    const { logout, user } = useAuth();

    const menuItems = [
        { path: '/receptionist/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/receptionist/patients', icon: Users, label: 'Bệnh nhân' },
        { path: '/receptionist/appointments', icon: Calendar, label: 'Lịch hẹn' },
        { path: '/receptionist/invoices', icon: DollarSign, label: 'Hóa đơn' },
        { path: '/receptionist/services', icon: ClipboardList, label: 'Dịch vụ' },
        { path: '/receptionist/equipment', icon: Wrench, label: 'Thiết bị' },
    ];

    return (
        <div className="fixed left-4 top-4 bottom-4 w-72 bg-white/90 backdrop-blur-2xl border border-teal-100/50 rounded-[2rem] shadow-[0_8px_32px_rgba(0,128,128,0.05)] flex flex-col z-50 overflow-hidden transition-all duration-300 ring-1 ring-teal-50">
            {/* Header */}
            <div className="px-8 pt-8 pb-6 relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-500/10 to-emerald-500/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="flex items-center gap-3 mb-1 relative z-10">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white font-bold shadow-lg shadow-teal-500/30 transform transition-transform hover:scale-105 hover:rotate-3 duration-300">
                        <span className="text-lg">R</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-800 to-emerald-600">
                            Reception
                        </span>
                        <span className="text-[0.65rem] font-bold text-teal-400/80 tracking-[0.2em] uppercase">Dental Care</span>
                    </div>
                </div>
            </div>

            {/* User Profile Card - Compact */}
            <Link to="/receptionist/profile" className="block mx-5 mb-4 group relative z-10">
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-teal-50/80 to-emerald-50/50 border border-teal-100/60 transition-all duration-300 group-hover:shadow-md group-hover:shadow-teal-100/50 group-hover:border-teal-200 group-hover:-translate-y-0.5">
                    <div className="flex items-center gap-3.5">
                        <div className="relative">
                            <div className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center text-teal-600 font-bold border-2 border-white ring-1 ring-teal-100 text-sm overflow-hidden">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span>{user?.full_name ? user.full_name.charAt(0) : 'R'}</span>
                                )}
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-800 truncate group-hover:text-teal-700 transition-colors">
                                {user?.full_name || 'Receptionist'}
                            </p>
                            <p className="text-xs text-teal-600/80 font-medium truncate flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                Online
                            </p>
                        </div>
                    </div>
                </div>
            </Link>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar relative z-10 py-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                'flex items-center px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 group relative overflow-hidden',
                                isActive
                                    ? 'text-white shadow-lg shadow-teal-500/25'
                                    : 'text-gray-500 hover:bg-teal-50/80 hover:text-teal-600'
                            )}
                        >
                            {isActive && (
                                <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-500 opacity-100" />
                            )}

                            <Icon
                                size={20}
                                className={clsx(
                                    "mr-3 transition-transform duration-300 relative z-10",
                                    isActive ? "scale-110" : "group-hover:scale-110 group-hover:rotate-3"
                                )}
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                            <span className="relative z-10">{item.label}</span>

                            {isActive && (
                                <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white animate-pulse z-10" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 mt-auto relative z-10">
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-300 border border-transparent hover:border-rose-100 group"
                >
                    <LogOut size={18} className="transition-transform group-hover:-translate-x-1" />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </div>
    );
};

export default ReceptionistSidebar;
