import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Calendar, ChevronDown, LogOut, User as UserIcon, FileText } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useState } from 'react';

const MainNavigation = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        setShowProfileMenu(false);
        navigate('/');
    };
    const scrollToBooking = () => {
        document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
    };
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">D</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">DCMS</h1>
                            <p className="text-xs text-gray-500">Dental Clinic</p>
                        </div>
                    </div>
                </Link>

                {/* Navigation Links - Desktop */}
                <div className="hidden lg:flex items-center gap-1">
                    <a
                        href="#about"
                        className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-all"
                    >
                        Về chúng tôi
                    </a>

                    <a
                        href="#price"
                        className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-all"
                    >
                        Bảng giá
                    </a>

                    <div className="relative group">
                        <a
                            href="#services"
                            className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-all flex items-center gap-1"
                        >
                            Dịch vụ
                            <ChevronDown size={14} className="group-hover:rotate-180 transition-transform" />
                        </a>
                        {/* Dropdown */}
                        <div className="absolute left-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                            <div className="py-1">
                                <a href="#services" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors">Nha Khoa Tổng Quát</a>
                                <a href="#services" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors">Nha Khoa Thẩm Mỹ</a>
                                <a href="#services" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors">Niềng Răng</a>
                                <a href="#services" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors">Cấy Ghép Implant</a>
                                <a href="#services" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors">Nha Khoa Trẻ Em</a>
                                <a href="#services" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors">Điều Trị Tủy</a>
                            </div>
                        </div>
                    </div>

                    <a
                        href="#doctors"
                        className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-all"
                    >
                        Bác sĩ
                    </a>

                    <a
                        href="#contact"
                        className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-all"
                    >
                        Liên hệ
                    </a>
                </div>

                {/* Right side CTAs */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={scrollToBooking}
                        className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-all shadow-sm hover:shadow-md"
                    >
                        <Calendar size={16} />
                        Đặt lịch ngay
                    </button>

                    {isAuthenticated ? (
                        <>
                            {/* Avatar Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-all"
                                >
                                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                                        {user?.name?.charAt(0) || 'U'}
                                    </div>
                                </button>

                                {/* Dropdown Menu */}
                                {showProfileMenu && (
                                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                                        {/* User Info */}
                                        <div className="px-4 py-3 border-b border-gray-200">
                                            <p className="font-semibold text-gray-900">{user?.name}</p>
                                            <p className="text-sm text-gray-500">{user?.email}</p>
                                            <span className="inline-block mt-1 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                                                {user?.role}
                                            </span>
                                        </div>

                                        {/* Menu Items */}
                                        <div className="py-1">
                                            <button
                                                onClick={() => {
                                                    setShowProfileMenu(false);
                                                    navigate('/profile');
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                            >
                                                <UserIcon size={16} />
                                                Xem profile
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setShowProfileMenu(false);
                                                    navigate('/appointments');
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                            >
                                                <Calendar size={16} />
                                                Danh sách lịch khám
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setShowProfileMenu(false);
                                                    navigate('/medical-records');
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                            >
                                                <FileText size={16} />
                                                Danh sách hồ sơ nha khoa
                                            </button>

                                            <div className="border-t border-gray-200 my-1"></div>

                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                            >
                                                <LogOut size={16} />
                                                Đăng xuất
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <Link
                            to="/login"
                            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:border-primary-600 hover:text-primary-600 hover:bg-gray-50 transition-all"
                        >
                            <LogIn size={16} />
                            <span className="hidden sm:inline">Đăng nhập</span>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MainNavigation;