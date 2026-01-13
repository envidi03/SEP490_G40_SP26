import { Link } from 'react-router-dom';
import { LogIn, Calendar, ChevronDown } from 'lucide-react';

const MainNavigation = () => {
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

                    <Link
                        to="/login"
                        className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:border-primary-600 hover:text-primary-600 hover:bg-gray-50 transition-all"
                    >
                        <LogIn size={16} />
                        <span className="hidden sm:inline">Đăng nhập</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default MainNavigation;