import React from 'react';
import { Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="bg-white shadow-sm h-16 fixed top-0 right-0 left-64 z-10">
            <div className="h-full px-6 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                        Xin chào, {user?.name || 'User'}!
                    </h2>
                    <p className="text-sm text-gray-500">{user?.role}</p>
                </div>

                <div className="flex items-center space-x-4">
                    {/* Notifications */}
                    <button className="p-2 hover:bg-gray-100 rounded-full relative transition-colors">
                        <Bell size={20} className="text-gray-600" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* User Menu */}
                    <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                            <User size={20} className="text-white" />
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors flex items-center space-x-1"
                        title="Đăng xuất"
                    >
                        <LogOut size={18} />
                        <span className="text-sm font-medium">Logout</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
