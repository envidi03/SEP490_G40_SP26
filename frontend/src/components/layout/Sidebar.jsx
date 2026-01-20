import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Users, Calendar, ClipboardList,
    DollarSign, Pill, Wrench, FileText, Settings,
    UserCog
} from 'lucide-react';
import clsx from 'clsx';

const Sidebar = ({ role }) => {
    const location = useLocation();

    const menuItems = {
        Admin: [
            { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { path: '/users', icon: UserCog, label: 'Người dùng' },
            { path: '/patients', icon: Users, label: 'Bệnh nhân' },
            { path: '/appointments', icon: Calendar, label: 'Lịch hẹn' },
            { path: '/treatments', icon: ClipboardList, label: 'Điều trị' },
            { path: '/invoices', icon: DollarSign, label: 'Hóa đơn' },
            { path: '/reports', icon: FileText, label: 'Báo cáo' },
            { path: '/medicines', icon: Pill, label: 'Thuốc' },
            { path: '/equipment', icon: Wrench, label: 'Thiết bị' },
        ],
        Doctor: [
            { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { path: '/dentist-patients', icon: Users, label: 'Bệnh nhân' },
            { path: '/dentist-appointments', icon: Calendar, label: 'Lịch hẹn' },
            { path: '/treatments', icon: ClipboardList, label: 'Điều trị' },
            { path: '/medicines', icon: Pill, label: 'Thuốc' },
            { path: '/leave-requests', icon: Calendar, label: 'Xin nghỉ phép' },
        ],
        Receptionist: [
            { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { path: '/patients', icon: Users, label: 'Bệnh nhân' },
            { path: '/appointments', icon: Calendar, label: 'Lịch hẹn' },
            { path: '/invoices', icon: DollarSign, label: 'Hóa đơn' },
        ],
    };

    const items = menuItems[role] || menuItems.Admin;

    return (
        <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 overflow-y-auto">
            {/* Logo */}
            <div className="p-6 border-b border-gray-800">
                <h1 className="text-2xl font-bold text-primary-400">DCMS</h1>
                <p className="text-sm text-gray-400 mt-1">Dental Clinic</p>
            </div>

            {/* Navigation */}
            <nav className="mt-6">
                {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                'flex items-center px-6 py-3 text-sm transition-colors',
                                isActive
                                    ? 'bg-primary-600 text-white border-l-4 border-primary-400'
                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white border-l-4 border-transparent'
                            )}
                        >
                            <Icon size={20} className="mr-3" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Settings at bottom */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-gray-800">
                <Link
                    to="/settings"
                    className="flex items-center px-6 py-4 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                >
                    <Settings size={20} className="mr-3" />
                    <span className="font-medium">Cài đặt</span>
                </Link>
            </div>
        </div>
    );
};

export default Sidebar;
