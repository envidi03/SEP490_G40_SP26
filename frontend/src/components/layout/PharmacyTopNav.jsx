import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Pill,
    Package,
    FileText,
    ClipboardList,
    LogOut,
    User,
    Store
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../contexts/AuthContext';

const PharmacyTopNav = () => {
    const location = useLocation();
    const { logout, user } = useAuth();

    const menuItems = [
        { path: '/pharmacy/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/pharmacy/medicines', icon: Pill, label: 'Kho Thuốc' },
        { path: '/pharmacy/inventory', icon: Package, label: 'Nhập/Xuất' },
        { path: '/pharmacy/prescriptions', icon: FileText, label: 'Đơn Thuốc' },
        { path: '/pharmacy/requests', icon: ClipboardList, label: 'Yêu Cầu' },
    ];

    return (
        <header className="bg-white border-b border-teal-100 sticky top-0 z-50 shadow-sm">
            <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo Area */}
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center text-white shadow-teal-200 shadow-lg">
                        <Store size={20} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-800 leading-tight">DCMS</h1>
                        <p className="text-[10px] text-teal-600 font-bold tracking-wider uppercase">Pharmacy</p>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex items-center gap-1 mx-6 overflow-x-auto no-scrollbar">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap',
                                    isActive
                                        ? 'bg-teal-50 text-teal-700 shadow-sm ring-1 ring-teal-200'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-teal-600'
                                )}
                            >
                                <Icon size={18} className={clsx(isActive ? "text-teal-600" : "text-gray-400")} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User & Actions */}
                <div className="flex items-center gap-4 pl-4 border-l border-gray-100">
                    <Link
                        to="/pharmacy/profile"
                        className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors group"
                    >
                        <div className="w-8 h-8 rounded-full bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-700 font-semibold group-hover:bg-teal-200 transition-colors">
                            {user?.full_name ? user.full_name.charAt(0) : 'P'}
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-xs font-bold text-gray-700 group-hover:text-teal-700 truncate max-w-[100px]">
                                {user?.full_name || 'Pharmacist'}
                            </p>
                        </div>
                    </Link>

                    <button
                        onClick={logout}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Đăng xuất"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default PharmacyTopNav;
