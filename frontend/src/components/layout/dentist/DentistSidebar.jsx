import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    FileText,
    ClipboardList,
    CheckSquare,
    Briefcase,
    ChevronDown,
    ChevronRight,
    Stethoscope,
} from 'lucide-react';
import clsx from 'clsx';

const DentistSidebar = () => {
    const location = useLocation();

    // Default expand all menus with children
    const [expandedMenus, setExpandedMenus] = useState({
        'dental-records': true
    });

    const toggleMenu = (key) => {
        setExpandedMenus(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const menuItems = [
        { path: '/dentist/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
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
    ];

    const isChildActive = (children) => children?.some(c => location.pathname === c.path);

    return (
        <div className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 h-screen fixed left-0 top-0 flex flex-col font-sans z-50 shadow-xl">
            {/* Logo Area */}
            <div className="flex flex-col items-center justify-center py-8 border-b border-slate-800/60 bg-slate-900/50">
                <h1 className="text-xl font-bold tracking-wide text-white">DCMS</h1>
                <p className="text-[11px] font-medium tracking-widest uppercase text-teal-400/80 mt-1">Dental Clinic</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar space-y-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;

                    // Collapsible group
                    if (item.children) {
                        const childActive = isChildActive(item.children);
                        const isOpen = expandedMenus[item.key] ?? childActive;

                        return (
                            <div key={item.key} className="mb-2">
                                {/* Group header */}
                                <button
                                    onClick={() => toggleMenu(item.key)}
                                    className={clsx(
                                        'w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group',
                                        childActive
                                            ? 'text-white'
                                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={clsx(
                                            "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                            childActive ? "bg-teal-500/10 text-teal-400" : "text-slate-500 group-hover:text-slate-300"
                                        )}>
                                            <Icon size={18} strokeWidth={childActive ? 2 : 1.5} />
                                        </div>
                                        <span className={clsx("text-sm font-medium", childActive && "font-semibold")}>
                                            {item.label}
                                        </span>
                                    </div>
                                    <div className={clsx(
                                        "transition-transform duration-200 text-slate-500 group-hover:text-slate-400",
                                        isOpen ? "rotate-90" : ""
                                    )}>
                                        <ChevronRight size={16} />
                                    </div>
                                </button>

                                {/* Sub-items */}
                                <div className={clsx(
                                    "overflow-hidden transition-all duration-300 ease-in-out pl-4",
                                    isOpen ? "max-h-[500px] opacity-100 mt-1" : "max-h-0 opacity-0"
                                )}>
                                    <div className="pl-6 border-l border-slate-700/50 py-1 space-y-1 ml-1.5">
                                        {item.children.map(child => {
                                            const ChildIcon = child.icon;
                                            const isActive = location.pathname === child.path;
                                            return (
                                                <Link
                                                    key={child.path}
                                                    to={child.path}
                                                    className={clsx(
                                                        'relative flex items-center px-3 py-2 text-[13px] rounded-lg transition-all duration-200',
                                                        isActive
                                                            ? 'text-white bg-slate-800/80 font-medium'
                                                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                                                    )}
                                                >
                                                    {/* Active dot indicator */}
                                                    {isActive && (
                                                        <span className="absolute -left-[2.5px] top-1/2 -translate-y-1/2 w-1 h-1.5 rounded-r-md bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.6)]"></span>
                                                    )}
                                                    <ChildIcon size={16} className="mr-2" />
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
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                'flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden',
                                isActive
                                    ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                            )}
                        >
                            <div className="flex items-center gap-3 relative z-10 w-full">
                                <div className={clsx(
                                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                    isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                                )}>
                                    <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                                </div>
                                <span className={clsx("text-sm", isActive ? "font-semibold" : "font-medium")}>
                                    {item.label}
                                </span>
                            </div>

                            {/* Inactive hover glow */}
                            {!isActive && (
                                <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #334155;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #475569;
                }
            `}</style>
        </div>
    );
};

export default DentistSidebar;
