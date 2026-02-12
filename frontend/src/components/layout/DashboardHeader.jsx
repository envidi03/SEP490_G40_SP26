import React, { useState } from 'react';
import { Bell, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getProfilePath = () => {
        const role = user?.role;
        if (role === 'ADMIN_CLINIC') return '/admin/profile';
        return '/';
    };

    return (
        <header className="bg-white shadow-sm h-16 fixed top-0 right-0 left-64 z-10">
            <div className="h-full px-6 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                        Xin chào, {user?.full_name || 'User'}!
                    </h2>
                    <p className="text-sm text-gray-500">{user?.role}</p>
                </div>

                <div className="flex items-center space-x-4">
                    {/* Notifications */}
                    <button className="p-2 hover:bg-gray-100 rounded-full relative transition-colors">
                        <Bell size={20} className="text-gray-600" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* User Menu with Dropdown */}
                    <div className="relative pl-4 border-l border-gray-200">
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-lg transition-colors"
                        >
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                                <p className="text-xs text-gray-500">{user?.email}</p>
                            </div>
                            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                                <User size={20} className="text-white" />
                            </div>
                            <ChevronDown
                                size={16}
                                className={`text-gray-600 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`}
                            />
                        </button>

                        {/* Dropdown Menu */}
                        {showProfileMenu && (
                            <>
                                {/* Overlay to close dropdown */}
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowProfileMenu(false)}
                                />

                                {/* Menu */}
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                                    {/* User Info */}
                                    <div className="px-4 py-3 border-b border-gray-200">
                                        <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                                        <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                                        <div className="mt-2">
                                            <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                                                {user?.role}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="py-2">
                                        <button
                                            onClick={() => {
                                                setShowProfileMenu(false);
                                                navigate(getProfilePath());
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors"
                                        >
                                            <User size={18} />
                                            Thông tin cá nhân
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowProfileMenu(false);
                                                navigate('/settings');
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors"
                                        >
                                            <Settings size={18} />
                                            Cài đặt
                                        </button>
                                    </div>

                                    {/* Logout */}
                                    <div className="border-t border-gray-200 pt-2">
                                        <button
                                            onClick={() => {
                                                setShowProfileMenu(false);
                                                handleLogout();
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                                        >
                                            <LogOut size={18} />
                                            Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
