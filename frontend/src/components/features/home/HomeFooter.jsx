import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import serviceService from '../../../services/serviceService';
import {
    Phone,
    Mail,
    MapPin,
    Facebook,
    Instagram,
    Youtube,
    Send,
    Clock,
    Award,
    Heart,
    Shield,
    Stethoscope,
    Sparkles,
    ChevronRight,
    ArrowUpRight,
    CheckCircle2
} from 'lucide-react';

const HomeFooter = () => {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);
    const [realServices, setRealServices] = useState([]);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await serviceService.getAllServices({ status: 'ACTIVE', limit: 5 });
                const servicesData = response.data?.data || response.data || [];
                setRealServices(servicesData);
            } catch (error) {
                console.error("Failed to fetch services for footer:", error);
            }
        };
        fetchServices();
    }, []);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email) {
            setSubscribed(true);
            setEmail('');
            setTimeout(() => setSubscribed(false), 3000);
        }
    };

    const footerLinks = {
        navigation: [
            { name: 'Trang chủ', path: '/' },
            { name: 'Giới thiệu', path: '/about' },
            { name: 'Dịch vụ', path: '/services' },
            { name: 'Đội ngũ bác sĩ', path: '/doctors' },
            { name: 'Tin tức', path: '/news' },
            { name: 'Liên hệ', path: '/contact' }
        ],
        support: [
            { name: 'Chính sách bảo mật', path: '/privacy-policy' },
            { name: 'Điều khoản sử dụng', path: '/terms' },
            { name: 'Câu hỏi thường gặp', path: '/faq' },
            { name: 'Hướng dẫn đặt lịch', path: '/guide' }
        ]
    };

    return (
        <footer className="relative bg-[#f8fbff] text-gray-900 pt-24 pb-12 overflow-hidden border-t border-blue-100">
            {/* Background Decor Effects */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-600/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* ─── TOP SECTION: BRAND & NEWSLETTER ─── */}
                <div className="grid lg:grid-cols-2 gap-16 pb-16 border-b border-gray-200/60 items-center">
                    <div>
                        <div className="flex items-center gap-3 mb-6 font-primary">
                            <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-200">
                                <Award className="text-white" size={28} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black tracking-tight text-primary-700">DCMS</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Premium Dental Care</p>
                            </div>
                        </div>
                        <h4 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                            Kiến tạo nụ cười <span className="text-primary-600">hoàn mỹ</span> cho bạn
                        </h4>
                        <p className="text-gray-600 max-w-lg leading-relaxed">
                            Hệ thống quản lý và chăm sóc nha khoa chuẩn quốc tế. Chúng tôi kết hợp giữa công nghệ AI hiện đại và đội ngũ y bác sĩ hàng đầu.
                        </p>
                    </div>

                    <div className="relative">
                        <div className="p-8 rounded-[2.5rem] bg-white shadow-xl shadow-blue-900/5 border border-blue-50 relative overflow-hidden group">
                            <div className="relative z-10">
                                <h5 className="text-xl font-bold mb-2 flex items-center gap-2 text-gray-800">
                                    <Sparkles size={20} className="text-primary-500" />
                                    Ưu đãi đặc quyền
                                </h5>
                                <p className="text-gray-500 text-sm mb-6 font-medium">Đăng ký để nhận kiến thức chăm sóc răng miệng sớm nhất.</p>

                                <form onSubmit={handleSubscribe} className="relative group/form">
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Địa chỉ email của bạn..."
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-primary-500 focus:bg-white transition-all text-gray-800 placeholder-gray-400 pr-16"
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-2 top-2 bottom-2 px-6 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center"
                                    >
                                        {subscribed ? <CheckCircle2 size={20} /> : <span className="font-bold text-sm">Gửi ngay</span>}
                                    </button>
                                </form>
                                {subscribed && (
                                    <motion.p
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-xs text-green-600 mt-3 font-semibold"
                                    >
                                        Đăng ký thành công! Cảm ơn bạn.
                                    </motion.p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── MAIN GRID ─── */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-12 py-20">
                    {/* Column 1: Services */}
                    <div className="lg:col-span-3">
                        <h5 className="font-bold text-lg mb-8 text-gray-900 relative inline-block">
                            Dịch vụ tiêu biểu
                            <span className="absolute -bottom-2 left-0 w-8 h-1 bg-primary-600 rounded-full"></span>
                        </h5>
                        <ul className="space-y-4 font-medium">
                            {realServices.length > 0 ? (
                                realServices.map((service, i) => (
                                    <li key={service._id || i}>
                                        <Link to={`/services?parentId=${service._id}`} className="text-gray-500 hover:text-primary-600 transition-all flex items-center gap-2 group">
                                            <ChevronRight size={14} className="text-primary-400 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                            {service.service_name}
                                        </Link>
                                    </li>
                                ))
                            ) : (
                                <li className="text-gray-400 text-sm">Đang tải dịch vụ...</li>
                            )}
                        </ul>
                    </div>

                    {/* Column 2: Navigation */}
                    <div className="lg:col-span-2">
                        <h5 className="font-bold text-lg mb-8 text-gray-900">Khám phá</h5>
                        <ul className="space-y-4 font-medium">
                            {footerLinks.navigation.map((link, i) => (
                                <li key={i}>
                                    <Link to={link.path} className="text-gray-500 hover:text-primary-600 transition-all">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Support */}
                    <div className="lg:col-span-3">
                        <h5 className="font-bold text-lg mb-8 text-gray-900">Hỗ trợ</h5>
                        <ul className="space-y-4 font-medium">
                            {footerLinks.support.map((link, i) => (
                                <li key={i}>
                                    <Link to={link.path} className="text-gray-500 hover:text-primary-600 transition-all">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 4: Contact Cards */}
                    <div className="lg:col-span-4">
                        <h5 className="font-bold text-lg mb-8 text-gray-900">Thông tin liên hệ</h5>
                        <div className="space-y-4">
                            <div className="flex gap-4 p-4 rounded-2xl bg-white border border-blue-50 shadow-sm hover:shadow-md hover:border-primary-100 transition-all group cursor-pointer">
                                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 flex-shrink-0 group-hover:bg-primary-600 group-hover:text-white transition-all">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Hotline tư vấn</p>
                                    <p className="text-lg font-bold text-gray-800">1900 6789</p>
                                </div>
                            </div>

                            <div className="flex gap-4 p-4 rounded-2xl bg-white border border-blue-50 shadow-sm hover:shadow-md hover:border-primary-100 transition-all group cursor-pointer">
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Địa chỉ</p>
                                    <p className="text-sm font-bold text-gray-800 leading-tight">123 Hoàn Kiếm, TP. Hà Nội</p>
                                </div>
                            </div>

                            <div className="flex gap-4 p-4 rounded-2xl bg-white border border-blue-50 shadow-sm hover:shadow-md hover:border-primary-100 transition-all group cursor-pointer">
                                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Giờ làm việc</p>
                                    <p className="text-sm font-bold text-gray-800">T2-CN: 08:00 - 20:00</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── BOTTOM SECTION ─── */}
                <div className="pt-10 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-gray-400 text-sm flex flex-col md:flex-row items-center gap-4 md:gap-8 font-medium">
                        <p>© 2026 <span className="text-primary-700 font-black">DCMS</span>. Bảo lưu mọi quyền.</p>
                        <div className="flex gap-4">
                            <span className="w-1 h-1 bg-gray-300 rounded-full hidden md:block mt-2"></span>
                            <p>Phát triển bởi Team SEP490_G40</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest hidden lg:block">Kết nối với chúng tôi</span>
                        <div className="flex gap-3">
                            {[
                                { icon: Facebook, color: 'hover:bg-[#1877F2]', text: 'text-gray-400' },
                                { icon: Instagram, color: 'hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:to-[#ee2a7b]', text: 'text-gray-400' },
                                { icon: Youtube, color: 'hover:bg-[#FF0000]', text: 'text-gray-400' }
                            ].map((social, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className={`w-11 h-11 bg-white border border-gray-200 rounded-xl flex items-center justify-center transition-all hover:-translate-y-2 hover:shadow-lg hover:border-transparent ${social.color} group`}
                                >
                                    <social.icon size={18} className={`${social.text} group-hover:text-white transition-colors`} />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default HomeFooter;
