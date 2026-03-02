import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    UserCog,
    ClipboardList,
    Pill,
    Wrench,
    Building2,
    DoorOpen,
    Users,
    Calendar,
    FileText,
    ClipboardCheck,
    Briefcase
} from 'lucide-react';
import clsx from 'clsx';

const Sidebar = ({ role }) => {
    const location = useLocation();


    const menuItems = {
        ADMIN_CLINIC: [
            { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { path: '/admin/users', icon: UserCog, label: 'Bác sĩ & Trợ lý' },
            { path: '/admin/rooms', icon: DoorOpen, label: 'Phòng khám' },
            { path: '/admin/services', icon: ClipboardList, label: 'Dịch vụ' },
            { path: '/admin/equipment', icon: Wrench, label: 'Thiết bị' },
            { path: '/admin/medicines', icon: Pill, label: 'Thuốc' },
            { path: '/admin/clinics', icon: Building2, label: 'Thông tin phòng khám' },
        ],
        Doctor: [
            { path: '/dentist/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { path: '/dentist/patients', icon: Users, label: 'Bệnh nhân' },
            { path: '/dentist/schedule', icon: Calendar, label: 'Lịch hẹn' },
            { path: '/dentist/medical-records', icon: FileText, label: 'Hồ Sơ' },
            { path: '/dentist/medical-record-approvals', icon: ClipboardCheck, label: 'Phê duyệt HS' },
            { path: '/dentist/leave-requests', icon: Briefcase, label: 'Nghỉ Phép' },
            { path: '/dentist/assistant-leave-requests', icon: UserCog, label: 'NP Trợ Lý' },
        ]
    };

    // Try to find menu items for the role (case-insensitive fallback)
    let items = menuItems[role];

    // If no exact match, try case-insensitive match
    if (!items && role) {
        const roleUpper = role.toUpperCase();
        const matchedKey = Object.keys(menuItems).find(key => key.toUpperCase() === roleUpper);
        items = matchedKey ? menuItems[matchedKey] : menuItems.ADMIN_CLINIC;
    } else if (!items) {
        // If no role provided, default to admin
        items = menuItems.ADMIN_CLINIC;
    }

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
        </div>
    );
};

export default Sidebar;
