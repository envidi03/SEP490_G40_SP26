import React, { useState } from 'react';
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
    Users
} from 'lucide-react';

const HomeFooter = () => {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email) {
            setSubscribed(true);
            setEmail('');
            setTimeout(() => setSubscribed(false), 3000);
        }
    };

    const services = [
        { icon: Stethoscope, name: 'Khám tổng quát' },
        { icon: Sparkles, name: 'Tẩy trắng răng' },
        { icon: Shield, name: 'Niềng răng' },
        { icon: Heart, name: 'Chăm sóc nha chu' }
    ];

    const stats = [
        { number: '10+', label: 'Năm kinh nghiệm' },
        { number: '50K+', label: 'Khách hàng' },
        { number: '15+', label: 'Bác sĩ chuyên môn' },
        { number: '98%', label: 'Hài lòng' }
    ];

    return (
        <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Stats Section */}
                <div className="py-12 border-b border-gray-700/50">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-primary-400 mb-2">
                                    {stat.number}
                                </div>
                                <div className="text-sm text-gray-400">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Footer Content */}
                <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
                    {/* About Section - 4 columns */}
                    <div className="lg:col-span-4">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center mr-3">
                                <Award className="text-white" size={24} />
                            </div>
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">
                                DCMS
                            </h3>
                        </div>
                        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                            Hệ thống quản lý phòng khám nha khoa hàng đầu Việt Nam.
                            Chúng tôi cam kết mang đến dịch vụ chăm sóc răng miệng chất lượng cao
                            với đội ngũ bác sĩ giàu kinh nghiệm và trang thiết bị hiện đại.
                        </p>

                        {/* Newsletter */}
                        <div className="bg-gray-800/50 rounded-lg p-4 backdrop-blur-sm border border-gray-700/50">
                            <h5 className="text-sm font-semibold mb-3 flex items-center">
                                <Send size={16} className="mr-2 text-primary-400" />
                                Đăng ký nhận tin
                            </h5>
                            <form onSubmit={handleSubscribe} className="flex gap-2">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email của bạn"
                                    className="flex-1 px-3 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-primary-400 transition-colors"
                                    disabled={subscribed}
                                />
                                <button
                                    type="submit"
                                    disabled={subscribed}
                                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${subscribed
                                            ? 'bg-green-500 text-white'
                                            : 'bg-primary-500 hover:bg-primary-600 text-white'
                                        }`}
                                >
                                    {subscribed ? '✓' : 'Gửi'}
                                </button>
                            </form>
                            {subscribed && (
                                <p className="text-xs text-green-400 mt-2">Đăng ký thành công!</p>
                            )}
                        </div>
                    </div>

                    {/* Services - 3 columns */}
                    <div className="lg:col-span-3">
                        <h4 className="text-lg font-semibold mb-4 flex items-center">
                            <Stethoscope size={20} className="mr-2 text-primary-400" />
                            Dịch vụ nổi bật
                        </h4>
                        <ul className="space-y-3">
                            {services.map((service, index) => {
                                const Icon = service.icon;
                                return (
                                    <li key={index}>
                                        <a
                                            href="#services"
                                            className="flex items-center text-gray-400 hover:text-white transition-colors group"
                                        >
                                            <div className="w-8 h-8 bg-gray-800/50 rounded-lg flex items-center justify-center mr-3 group-hover:bg-primary-500/20 transition-colors">
                                                <Icon size={16} className="text-primary-400" />
                                            </div>
                                            <span className="text-sm">{service.name}</span>
                                        </a>
                                    </li>
                                );
                            })}
                        </ul>
                        <div className="mt-6">
                            <a
                                href="#services"
                                className="text-sm text-primary-400 hover:text-primary-300 transition-colors inline-flex items-center group"
                            >
                                Xem tất cả dịch vụ
                                <span className="ml-1 group-hover:ml-2 transition-all">→</span>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links - 2 columns */}
                    <div className="lg:col-span-2">
                        <h4 className="text-lg font-semibold mb-4">Điều hướng</h4>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <a href="#about" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-block">
                                    Về chúng tôi
                                </a>
                            </li>
                            <li>
                                <a href="#services" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-block">
                                    Dịch vụ
                                </a>
                            </li>
                            <li>
                                <a href="#team" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-block">
                                    Đội ngũ bác sĩ
                                </a>
                            </li>
                            <li>
                                <a href="#booking" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-block">
                                    Đặt lịch khám
                                </a>
                            </li>
                            <li>
                                <a href="#contact" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-block">
                                    Liên hệ
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors hover:translate-x-1 inline-block">
                                    Chính sách bảo mật
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info - 3 columns */}
                    <div className="lg:col-span-3">
                        <h4 className="text-lg font-semibold mb-4">Thông tin liên hệ</h4>
                        <ul className="space-y-4 text-sm">
                            <li>
                                <div className="flex items-start group">
                                    <div className="w-9 h-9 bg-gray-800/50 rounded-lg flex items-center justify-center mr-3 group-hover:bg-primary-500/20 transition-colors flex-shrink-0">
                                        <MapPin size={16} className="text-primary-400" />
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs mb-1">Địa chỉ</p>
                                        <p className="text-gray-300">123 Hoàn Kiếm, Hà Nội</p>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div className="flex items-start group">
                                    <div className="w-9 h-9 bg-gray-800/50 rounded-lg flex items-center justify-center mr-3 group-hover:bg-primary-500/20 transition-colors flex-shrink-0">
                                        <Phone size={16} className="text-primary-400" />
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs mb-1">Hotline</p>
                                        <a href="tel:0901234567" className="text-gray-300 hover:text-white transition-colors">
                                            0901 234 567
                                        </a>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div className="flex items-start group">
                                    <div className="w-9 h-9 bg-gray-800/50 rounded-lg flex items-center justify-center mr-3 group-hover:bg-primary-500/20 transition-colors flex-shrink-0">
                                        <Mail size={16} className="text-primary-400" />
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs mb-1">Email</p>
                                        <a href="mailto:contact@dcms.com" className="text-gray-300 hover:text-white transition-colors">
                                            contact@dcms.com
                                        </a>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div className="flex items-start group">
                                    <div className="w-9 h-9 bg-gray-800/50 rounded-lg flex items-center justify-center mr-3 group-hover:bg-primary-500/20 transition-colors flex-shrink-0">
                                        <Clock size={16} className="text-primary-400" />
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs mb-1">Giờ làm việc</p>
                                        <p className="text-gray-300">T2-T6: 8:00 - 20:00</p>
                                        <p className="text-gray-300">T7-CN: 8:00 - 17:00</p>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="border-t border-gray-700/50 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        {/* Copyright */}
                        <div className="text-sm text-gray-400 text-center md:text-left">
                            <p>© 2026 DCMS - Dental Clinic Management System.</p>
                            <p className="text-xs text-gray-500 mt-1">Thiết kế bởi Team SEP490_G40</p>
                        </div>

                        {/* Social Media */}
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500 hidden md:block">Kết nối với chúng tôi:</span>
                            <div className="flex gap-3">
                                <a
                                    href="#"
                                    className="w-10 h-10 bg-gray-800/50 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all hover:scale-110 hover:-translate-y-1 group"
                                    aria-label="Facebook"
                                >
                                    <Facebook size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                                </a>
                                <a
                                    href="#"
                                    className="w-10 h-10 bg-gray-800/50 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600 rounded-lg flex items-center justify-center transition-all hover:scale-110 hover:-translate-y-1 group"
                                    aria-label="Instagram"
                                >
                                    <Instagram size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                                </a>
                                <a
                                    href="#"
                                    className="w-10 h-10 bg-gray-800/50 hover:bg-red-600 rounded-lg flex items-center justify-center transition-all hover:scale-110 hover:-translate-y-1 group"
                                    aria-label="Youtube"
                                >
                                    <Youtube size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default HomeFooter;
