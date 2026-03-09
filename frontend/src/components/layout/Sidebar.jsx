import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    UserCog,
    ClipboardList,
    Pill,
    Wrench,
    Building2,
    DoorOpen,
    Calendar,
    FileText,
    ClipboardCheck,
    Briefcase,
    ChevronDown,
    ChevronRight,
    Stethoscope,
    CheckSquare,
    PackagePlus
} from 'lucide-react';
import clsx from 'clsx';

const Sidebar = ({ role }) => {
    const location = useLocation();
    const [expandedMenus, setExpandedMenus] = useState({});

    const toggleMenu = (key) => {
        setExpandedMenus(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const menuItems = {
        ADMIN_CLINIC: [
            { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { path: '/admin/users', icon: UserCog, label: 'Bác sĩ & Trợ lý' },
            { path: '/admin/rooms', icon: DoorOpen, label: 'Phòng khám' },
            { path: '/admin/services', icon: ClipboardList, label: 'Dịch vụ' },
            { path: '/admin/equipment', icon: Wrench, label: 'Thiết bị' },
            { path: '/admin/medicines', icon: Pill, label: 'Thuốc' },
            { path: '/admin/leave-management', icon: Calendar, label: 'Quản lý Nghỉ phép' },
            { path: '/admin/restock-requests', icon: PackagePlus, label: 'Yêu cầu Nhập thuốc' },
            { path: '/admin/clinics', icon: Building2, label: 'Thông tin phòng khám' },
        ],
        Doctor: [
            { path: '/dentist/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { path: '/dentist/schedule', icon: Calendar, label: 'Lịch hẹn' },
            {
                key: 'dental-records',
                icon: Stethoscope,
                label: 'Quản lý hồ sơ nha khoa',
                children: [
                    { path: '/dentist/dental-records/search', icon: ClipboardList, label: 'Tìm kiếm hồ sơ' },
                    { path: '/dentist/treatments', icon: ClipboardList, label: 'Xem phiếu điều trị' },
                    { path: '/dentist/treatment-approvals', icon: CheckSquare, label: 'Phê duyệt phiếu' },
                ]
            },
            { path: '/dentist/leave-requests', icon: Briefcase, label: 'Nghỉ Phép' },
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

    const isChildActive = (children) => children?.some(c => location.pathname === c.path);

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

                    // Collapsible group
                    if (item.children) {
                        const childActive = isChildActive(item.children);
                        const isOpen = expandedMenus[item.key] ?? childActive;

                        return (
                            <div key={item.key}>
                                {/* Group header */}
                                <button
                                    onClick={() => toggleMenu(item.key)}
                                    className={clsx(
                                        'w-full flex items-center justify-between px-6 py-3 text-sm transition-colors',
                                        childActive
                                            ? 'bg-primary-700 text-white border-l-4 border-primary-400'
                                            : 'text-gray-300 hover:bg-gray-800 hover:text-white border-l-4 border-transparent'
                                    )}
                                >
                                    <div className="flex items-center">
                                        <Icon size={20} className="mr-3" />
                                        <span className="font-medium">{item.label}</span>
                                    </div>
                                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </button>

                                {/* Sub-items */}
                                {isOpen && (
                                    <div className="bg-gray-800">
                                        {item.children.map(child => {
                                            const ChildIcon = child.icon;
                                            const isActive = location.pathname === child.path;
                                            return (
                                                <Link
                                                    key={child.path}
                                                    to={child.path}
                                                    className={clsx(
                                                        'flex items-center pl-12 pr-6 py-2.5 text-sm transition-colors',
                                                        isActive
                                                            ? 'bg-primary-600 text-white border-l-4 border-primary-300'
                                                            : 'text-gray-400 hover:bg-gray-700 hover:text-white border-l-4 border-transparent'
                                                    )}
                                                >
                                                    <ChildIcon size={16} className="mr-2" />
                                                    <span>{child.label}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    // Normal item
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
