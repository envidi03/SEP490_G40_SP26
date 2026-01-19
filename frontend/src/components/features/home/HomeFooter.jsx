import React from 'react';
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';

const HomeFooter = () => {
    return (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div>
                        <h3 className="text-2xl font-bold text-primary-400 mb-4">DCMS</h3>
                        <p className="text-gray-400 text-sm">
                            Hệ thống quản lý phòng khám nha khoa hiện đại, chuyên nghiệp.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Liên kết nhanh</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#about" className="text-gray-400 hover:text-white transition-colors">Về chúng tôi</a></li>
                            <li><a href="#services" className="text-gray-400 hover:text-white transition-colors">Dịch vụ</a></li>
                            <li><a href="#contact" className="text-gray-400 hover:text-white transition-colors">Liên hệ</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Liên hệ</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li className="flex items-center">
                                <Phone size={16} className="mr-2" />
                                <span>0901 234 567</span>
                            </li>
                            <li className="flex items-center">
                                <Mail size={16} className="mr-2" />
                                <span>contact@dcms.com</span>
                            </li>
                            <li className="flex items-start">
                                <MapPin size={16} className="mr-2 mt-1" />
                                <span>123 Nguyễn Huệ, Q1, TP.HCM</span>
                            </li>
                        </ul>
                    </div>

                    {/* Social Media */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Mạng xã hội</h4>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                                <Facebook size={24} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                                <Instagram size={24} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">
                                <Youtube size={24} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
                    <p>© 2026 DCMS - Dental Clinic Management System. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default HomeFooter;
