import React from 'react';
import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';

const Header = () => {
    return (
        <nav className="bg-white shadow-sm fixed w-full top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <h1 className="text-2xl font-bold text-primary-600">DCMS</h1>
                        <span className="ml-2 text-sm text-gray-600">Dental Clinic</span>
                    </div>
                    <div className="hidden md:flex space-x-8">
                        <a href="#about" className="text-gray-700 hover:text-primary-600 transition-colors">Về chúng tôi</a>
                        <a href="#services" className="text-gray-700 hover:text-primary-600 transition-colors">Dịch vụ</a>
                        <a href="#contact" className="text-gray-700 hover:text-primary-600 transition-colors">Liên hệ</a>
                    </div>
                    <Link
                        to="/login"
                        className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        <LogIn size={18} className="mr-2" />
                        Đăng nhập
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Header;
