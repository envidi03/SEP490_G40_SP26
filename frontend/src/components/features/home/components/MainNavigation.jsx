import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Calendar, ChevronDown, LogOut, User as UserIcon, FileText } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { getProfile } from '../../../../services/profileService';
import serviceService from '../../../../services/serviceService';

const MainNavigation = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showServicesMenu, setShowServicesMenu] = useState(false);
    const [services, setServices] = useState([]);
    const navigate = useNavigate();
    const [avatarUrl, setAvatarUrl] = useState('');

    // Fetch avatar khi user đã đăng nhập
    useEffect(() => {
        if (isAuthenticated) {
            getProfile()
                .then((res) => {
                    setAvatarUrl(res.data?.avatar_url || '');
                })
        }
    }, [isAuthenticated]);

    // Fetch services cho dropdown
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await serviceService.getAllServices({ limit: 100, filter: 'AVAILABLE' });
                setServices(res?.data || []);
            } catch (err) {
                console.error('Fetch services navbar error:', err);
            }
        };
        fetchServices();
    }, []);

    const handleLogout = async () => {
        await logout();
        setShowProfileMenu(false);
        navigate('/');
    };

    const handleBookingClick = () => {
        navigate('/book-appointment');
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
                    <Link
                        to="/about"
                        className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-all"
                    >
                        Về chúng tôi
                    </Link>

                    <Link
                        to="/pricing"
                        className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-all"
                    >
                        Bảng giá
                    </Link>

                    {/* Services Dropdown */}
                    <div 
                        className="relative group"
                        onMouseEnter={() => setShowServicesMenu(true)}
                        onMouseLeave={() => setShowServicesMenu(false)}
                    >
                        <button
                            className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                                showServicesMenu ? 'text-primary-600 bg-gray-50' : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                            }`}
                        >
                            Dịch vụ
                            <ChevronDown size={14} className={`transition-transform duration-200 ${showServicesMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {showServicesMenu && (
                            <div className="absolute left-0 top-full w-64 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="px-4 py-2 border-b border-gray-50 mb-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Danh mục dịch vụ</p>
                                </div>
                                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                                    {services.length > 0 ? (
                                        services.map((svc) => (
                                            <Link
                                                key={svc._id}
                                                to={`/services?parentId=${svc._id}`}
                                                className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                                                onClick={() => setShowServicesMenu(false)}
                                            >
                                                {svc.service_name}
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="px-4 py-3 text-sm text-gray-400 italic">Đang tải...</div>
                                    )}
                                </div>
                                <div className="border-t border-gray-50 mt-1 pt-1">
                                    <Link
                                        to="/services"
                                        className="block px-4 py-2 text-sm font-semibold text-primary-600 hover:bg-primary-50 transition-colors"
                                        onClick={() => setShowServicesMenu(false)}
                                    >
                                        Tất cả dịch vụ →
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    <Link
                        to="/doctors"
                        className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-all"
                    >
                        Bác sĩ
                    </Link>

                    <Link
                        to="/contact"
                        className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-all"
                    >
                        Liên hệ
                    </Link>
                </div>

                {/* Right side CTAs */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleBookingClick}
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
                                    <div className="w-10 h-10 rounded-full overflow-hidden shadow-md">
                                        {avatarUrl ? (
                                            <img
                                                src={avatarUrl}
                                                alt="Avatar"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-primary-50 border border-primary-200 flex items-center justify-center">
                                                <span className="text-primary-700 font-bold text-lg">
                                                    {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                                                </span>
                                            </div>
                                        )}
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