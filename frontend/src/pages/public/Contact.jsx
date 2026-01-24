import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, Facebook, Instagram, Youtube } from 'lucide-react';
import PublicLayout from '../../components/layout/PublicLayout';
import Breadcrumb from '../../components/ui/Breadcrumb';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        service: '',
        message: ''
    });

    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission
        console.log('Form submitted:', formData);
        setSubmitted(true);

        // Reset form after 3 seconds
        setTimeout(() => {
            setSubmitted(false);
            setFormData({
                name: '',
                phone: '',
                email: '',
                service: '',
                message: ''
            });
        }, 3000);
    };

    const clinics = [
        {
            name: 'Chi nhánh Quận 1',
            address: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
            phone: '(028) 3822 1234',
            email: 'q1@dcms.vn',
            hours: 'T2-T7: 8:00 - 20:00 | CN: 8:00 - 17:00'
        },
        {
            name: 'Chi nhánh Quận 3',
            address: '456 Võ Văn Tần, Phường 5, Quận 3, TP.HCM',
            phone: '(028) 3930 5678',
            email: 'q3@dcms.vn',
            hours: 'T2-T7: 8:00 - 20:00 | CN: 8:00 - 17:00'
        },
        {
            name: 'Chi nhánh Hà Nội',
            address: '789 Láng Hạ, Phường Thành Công, Quận Ba Đình, Hà Nội',
            phone: '(024) 3514 9012',
            email: 'hanoi@dcms.vn',
            hours: 'T2-T7: 8:00 - 20:00 | CN: 8:00 - 17:00'
        }
    ];

    return (
        <PublicLayout>
            <div className="bg-gray-50 py-8">
                {/* Breadcrumb */}
                <Breadcrumb items={[
                    { label: 'Trang chủ', path: '/' },
                    { label: 'Liên hệ' }
                ]} />

                <div className="max-w-7xl mx-auto px-4">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Liên Hệ Với Chúng Tôi
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Chúng tôi luôn sẵn sàng tư vấn và hỗ trợ bạn. Hãy để lại thông tin hoặc liên hệ trực tiếp với chúng tôi
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-sm p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Gửi tin nhắn cho chúng tôi</h2>

                                {submitted ? (
                                    <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="text-green-600">
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-green-900">Gửi thành công!</h3>
                                                <p className="text-green-700">Chúng tôi sẽ liên hệ lại với bạn trong thời gian sớm nhất.</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Name */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Họ và tên <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    required
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                    placeholder="Nguyễn Văn A"
                                                />
                                            </div>

                                            {/* Phone */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Số điện thoại <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    required
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                    placeholder="0901234567"
                                                />
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                placeholder="email@example.com"
                                            />
                                        </div>

                                        {/* Service */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Dịch vụ quan tâm
                                            </label>
                                            <select
                                                name="service"
                                                value={formData.service}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                            >
                                                <option value="">Chọn dịch vụ</option>
                                                <option value="chinh-nha">Chỉnh nha</option>
                                                <option value="implant">Cấy ghép Implant</option>
                                                <option value="tham-my">Nha khoa thẩm mỹ</option>
                                                <option value="tre-em">Nha khoa trẻ em</option>
                                                <option value="tong-quat">Nha khoa tổng quát</option>
                                                <option value="khac">Khác</option>
                                            </select>
                                        </div>

                                        {/* Message */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Nội dung tin nhắn
                                            </label>
                                            <textarea
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                rows="5"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                placeholder="Nhập nội dung bạn muốn tư vấn..."
                                            />
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            className="w-full md:w-auto px-8 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold flex items-center justify-center gap-2"
                                        >
                                            <Send size={20} />
                                            Gửi tin nhắn
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>

                        {/* Contact Info Sidebar */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Quick Contact */}
                            <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg shadow-sm p-6 text-white">
                                <h3 className="text-xl font-bold mb-4">Liên hệ nhanh</h3>

                                <div className="space-y-4">
                                    <a href="tel:19008059" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                            <Phone size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm opacity-90">Hotline</p>
                                            <p className="font-semibold">1900 8059</p>
                                        </div>
                                    </a>

                                    <a href="mailto:contact@dcms.vn" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                            <Mail size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm opacity-90">Email</p>
                                            <p className="font-semibold">contact@dcms.vn</p>
                                        </div>
                                    </a>

                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                            <Clock size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm opacity-90">Giờ làm việc</p>
                                            <p className="font-semibold">T2-T7: 8:00 - 20:00</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-white/20">
                                    <p className="text-sm mb-3">Kết nối với chúng tôi</p>
                                    <div className="flex gap-3">
                                        <a href="#" className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors">
                                            <Facebook size={20} />
                                        </a>
                                        <a href="#" className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors">
                                            <Instagram size={20} />
                                        </a>
                                        <a href="#" className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors">
                                            <Youtube size={20} />
                                        </a>
                                        <a href="#" className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors">
                                            <MessageCircle size={20} />
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Emergency */}
                            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
                                <h3 className="font-bold text-red-900 mb-2">Cấp cứu nha khoa 24/7</h3>
                                <p className="text-sm text-red-700 mb-3">
                                    Đau răng cấp tính, chấn thương răng miệng
                                </p>
                                <a href="tel:19008059" className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold">
                                    <Phone size={18} />
                                    Gọi ngay
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Map Placeholder */}
                    <div className="bg-white rounded-lg shadow-sm p-4">
                        <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                            <div className="text-center text-gray-500">
                                <MapPin size={48} className="mx-auto mb-2" />
                                <p className="font-medium">Google Maps sẽ được tích hợp tại đây</p>
                                <p className="text-sm">123 Nguyễn Huệ, Quận 1, TP.HCM</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default Contact;
