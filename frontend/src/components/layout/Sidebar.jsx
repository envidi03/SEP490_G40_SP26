import { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
    PackagePlus,
    Plus,
    List
} from 'lucide-react';
import clsx from 'clsx';

const Sidebar = ({ role }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [expandedMenus, setExpandedMenus] = useState({});
    const hoverTimeoutRef = useRef({});

    const toggleMenu = (key, value) => {
        setExpandedMenus(prev => ({
            ...prev,
            [key]: typeof value === 'boolean' ? value : !prev[key]
        }));
    };

    const handleMouseEnter = (key) => {
        if (hoverTimeoutRef.current[key]) {
            clearTimeout(hoverTimeoutRef.current[key]);
            delete hoverTimeoutRef.current[key];
        }
        toggleMenu(key, true);
    };

    const handleMouseLeave = (key) => {
        hoverTimeoutRef.current[key] = setTimeout(() => {
            toggleMenu(key, false);
            delete hoverTimeoutRef.current[key];
        }, 150); // Small delay to prevent flickering
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

    const isChildActive = (children) => {
        const currentPath = location.pathname + location.search;
        return children?.some(c => currentPath === c.path);
    };

    return (
        <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 overflow-y-auto z-50 shadow-2xl">
            {/* Logo */}
            <div className="p-6 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Stethoscope className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white">DMCS</h1>
                        <p className="text-[10px] font-bold text-primary-400 uppercase tracking-widest">Dental Clinic</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="mt-6 px-3 space-y-1">
                {items.map((item) => {
                    const Icon = item.icon;

                    // Collapsible group
                    if (item.children) {
                        const childActive = isChildActive(item.children);
                        const isOpen = expandedMenus[item.key] ?? childActive;

                        return (
                            <div
                                key={item.key}
                                onMouseEnter={() => handleMouseEnter(item.key)}
                                onMouseLeave={() => handleMouseLeave(item.key)}
                                className="relative group/group"
                            >
                                {/* Group header */}
                                <div className="relative overflow-hidden rounded-xl bg-transparent">
                                    <Link
                                        to={item.path || '#'}
                                        onClick={(e) => {
                                            if (!item.path) {
                                                e.preventDefault();
                                                toggleMenu(item.key);
                                            }
                                        }}
                                        className={clsx(
                                            'w-full flex items-center justify-between px-4 py-3 text-sm transition-all duration-200',
                                            childActive
                                                ? 'bg-primary-600/10 text-primary-400 font-bold'
                                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                        )}
                                    >
                                        <div className="flex items-center">
                                            <Icon size={20} className={clsx('mr-3', childActive ? 'text-primary-400' : 'text-gray-500 group-hover/group:text-white')} />
                                            <span>{item.label}</span>
                                        </div>
                                        <ChevronDown size={14} className={clsx('transition-transform duration-300', isOpen ? 'rotate-180' : 'rotate-0', childActive ? 'text-primary-400' : 'text-gray-600')} />
                                    </Link>
                                    {childActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 rounded-full" />}
                                </div>

                                {/* Sub-items */}
                                <div className={clsx(
                                    'overflow-hidden transition-all duration-300 ease-in-out',
                                    isOpen ? 'max-h-64 mt-1' : 'max-h-0'
                                )}>
                                    <div className="pl-6 space-y-1 py-1 border-l border-gray-800 ml-6">
                                        {item.children.map(child => {
                                            const ChildIcon = child.icon;
                                            const isActive = (location.pathname + location.search) === child.path;
                                            return (
                                                <Link
                                                    key={child.path}
                                                    to={child.path}
                                                    className={clsx(
                                                        'flex items-center px-4 py-2.5 text-xs rounded-lg transition-all duration-200',
                                                        isActive
                                                            ? 'bg-primary-600 text-white font-bold shadow-lg shadow-primary-600/20'
                                                            : 'text-gray-500 hover:text-gray-200 hover:bg-gray-800'
                                                    )}
                                                >
                                                    <ChildIcon size={14} className="mr-3 shrink-0" />
                                                    <span>{child.label}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    // Normal item
                    const isActive = location.pathname === item.path;
                    return (
                        <div key={item.path} className="relative overflow-hidden rounded-xl">
                            <Link
                                to={item.path}
                                className={clsx(
                                    'flex items-center px-4 py-3 text-sm transition-all duration-200',
                                    isActive
                                        ? 'bg-primary-600/10 text-primary-400 font-bold'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                )}
                            >
                                <Icon size={20} className={clsx('mr-3', isActive ? 'text-primary-400' : 'text-gray-500 group-hover:text-white')} />
                                <span>{item.label}</span>
                            </Link>
                            {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 rounded-full" />}
                        </div>
                    );
                })}
            </nav>
        </div>
    );
};

export default Sidebar;

