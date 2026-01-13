import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Smile, Sparkles, Scissors, Wrench, Baby, Heart,
    CheckCircle, Award, Shield, Clock, Users, Star,
    Calendar, Phone, Mail, MapPin, User, MessageSquare
} from 'lucide-react';
import BannerCarousel from './components/BannerCarousel';

const HomeContent = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        service: '',
        date: '',
        time: '',
        notes: ''
    });
    const [formStatus, setFormStatus] = useState({ type: '', message: '' });


    const services = [
        {
            icon: Smile,
            title: 'Nha Khoa Tổng Quát',
            description: 'Khám và tư vấn sức khỏe răng miệng, vệ sinh răng miệng định kỳ',
            color: 'bg-blue-100 text-blue-600'
        },
        {
            icon: Sparkles,
            title: 'Nha Khoa Thẩm Mỹ',
            description: 'Tẩy trắng răng, dán sứ veneer, thiết kế nụ cười hoàn hảo',
            color: 'bg-purple-100 text-purple-600'
        },
        {
            icon: Scissors,
            title: 'Niềng Răng',
            description: 'Chỉnh nha invisalign, niềng răng mắc cài kim loại và sứ',
            color: 'bg-pink-100 text-pink-600'
        },
        {
            icon: Wrench,
            title: 'Cấy Ghép Implant',
            description: 'Trồng răng implant công nghệ cao, phục hồi răng mất',
            color: 'bg-green-100 text-green-600'
        },
        {
            icon: Baby,
            title: 'Nha Khoa Trẻ Em',
            description: 'Chăm sóc răng miệng cho bé, điều trị sâu răng sữa an toàn',
            color: 'bg-yellow-100 text-yellow-600'
        },
        {
            icon: Heart,
            title: 'Điều Trị Tủy',
            description: 'Điều trị viêm tủy, chữa tủy răng, nhổ răng khôn an toàn',
            color: 'bg-red-100 text-red-600'
        }
    ];

    const benefits = [
        {
            icon: Award,
            title: 'Bác Sĩ Giàu Kinh Nghiệm',
            description: 'Đội ngũ bác sĩ chuyên môn cao, tận tâm với nghề'
        },
        {
            icon: Shield,
            title: 'Trang Thiết Bị Hiện Đại',
            description: 'Máy móc công nghệ tiên tiến, đảm bảo chất lượng'
        },
        {
            icon: CheckCircle,
            title: 'Vệ Sinh An Toàn',
            description: 'Quy trình vô trùng nghiêm ngặt, đảm bảo an toàn'
        },
        {
            icon: Clock,
            title: 'Tiết Kiệm Thời Gian',
            description: 'Đặt lịch online, không phải chờ đợi lâu'
        },
        {
            icon: Users,
            title: 'Chăm Sóc Tận Tình',
            description: 'Phục vụ chu đáo, tư vấn nhiệt tình và thân thiện'
        }
    ];

    const timeSlots = [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
        '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation
        if (!formData.fullName || !formData.phone || !formData.email || !formData.service || !formData.date || !formData.time) {
            setFormStatus({
                type: 'error',
                message: 'Vui lòng điền đầy đủ thông tin bắt buộc!'
            });
            return;
        }

        // Phone validation
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(formData.phone)) {
            setFormStatus({
                type: 'error',
                message: 'Số điện thoại không hợp lệ!'
            });
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setFormStatus({
                type: 'error',
                message: 'Email không hợp lệ!'
            });
            return;
        }

        // Success (in real app, send to backend)
        setFormStatus({
            type: 'success',
            message: `Cảm ơn ${formData.fullName}! Chúng tôi đã nhận được yêu cầu đặt lịch của bạn. Nhân viên sẽ liên hệ xác nhận trong thời gian sớm nhất.`
        });

        // Reset form
        setFormData({
            fullName: '',
            phone: '',
            email: '',
            service: '',
            date: '',
            time: '',
            notes: ''
        });

        // Clear message after 5 seconds
        setTimeout(() => {
            setFormStatus({ type: '', message: '' });
        }, 5000);
    };

    const scrollToBooking = () => {
        document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
    };
    return (
        <div>
            {/* Carousel Banner */}
            <section className="relative bg-gradient-to-r from-blue-100 to-purple-100 pt-[109px] overflow-hidden">
                {/* Carousel Container */}
                <BannerCarousel />
            </section>

            {/* Featured Services Gallery - Parkway Style */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Chăm sóc sức khỏe răng miệng toàn diện</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {/* Service 1 */}
                        <div className="group cursor-pointer">
                            <div className="relative overflow-hidden rounded-2xl aspect-square mb-3 bg-gray-100">
                                <img
                                    src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400&h=400&fit=crop"
                                    alt="Niềng răng trong suốt Invisalign"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                            </div>
                            <p className="text-center text-sm font-semibold text-gray-900">Niềng răng trong suốt<br />Invisalign</p>
                        </div>

                        {/* Service 2 */}
                        <div className="group cursor-pointer">
                            <div className="relative overflow-hidden rounded-2xl aspect-square mb-3 bg-gray-100">
                                <img
                                    src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=400&h=400&fit=crop"
                                    alt="Niềng răng mắc cài tiết kiệm"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                            </div>
                            <p className="text-center text-sm font-semibold text-gray-900">Niềng răng mắc cài tiết<br />kiệm</p>
                        </div>

                        {/* Service 3 */}
                        <div className="group cursor-pointer">
                            <div className="relative overflow-hidden rounded-2xl aspect-square mb-3 bg-gray-100">
                                <img
                                    src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400&h=400&fit=crop"
                                    alt="Nha trẻ em"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                            </div>
                            <p className="text-center text-sm font-semibold text-gray-900">Nha trẻ em</p>
                        </div>

                        {/* Service 4 */}
                        <div className="group cursor-pointer">
                            <div className="relative overflow-hidden rounded-2xl aspect-square mb-3 bg-gray-100">
                                <img
                                    src="https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=400&h=400&fit=crop"
                                    alt="Trồng răng Implant"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                            </div>
                            <p className="text-center text-sm font-semibold text-gray-900">Trồng răng Implant</p>
                        </div>

                        {/* Service 5 */}
                        <div className="group cursor-pointer">
                            <div className="relative overflow-hidden rounded-2xl aspect-square mb-3 bg-gray-100">
                                <img
                                    src="https://images.unsplash.com/photo-1609840114035-3c981960dc59?w=400&h=400&fit=crop"
                                    alt="Lấy cao răng"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                            </div>
                            <p className="text-center text-sm font-semibold text-gray-900">Lấy cao răng</p>
                        </div>

                        {/* Service 6 */}
                        <div className="group cursor-pointer">
                            <div className="relative overflow-hidden rounded-2xl aspect-square mb-3 bg-gray-100">
                                <img
                                    src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400&h=400&fit=crop&sat=-100"
                                    alt="Niềng răng trong suốt cho Teen"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                            </div>
                            <p className="text-center text-sm font-semibold text-gray-900">Niềng răng trong suốt<br />cho Teen</p>
                        </div>

                        {/* Service 7 */}
                        <div className="group cursor-pointer">
                            <div className="relative overflow-hidden rounded-2xl aspect-square mb-3 bg-gray-100">
                                <img
                                    src="https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=400&h=400&fit=crop"
                                    alt="Niềng răng mắc cài"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                            </div>
                            <p className="text-center text-sm font-semibold text-gray-900">Niềng răng mắc cài</p>
                        </div>

                        {/* Service 8 */}
                        <div className="group cursor-pointer">
                            <div className="relative overflow-hidden rounded-2xl aspect-square mb-3 bg-gray-100">
                                <img
                                    src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop"
                                    alt="Nhổ răng khôn"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                            </div>
                            <p className="text-center text-sm font-semibold text-gray-900">Nhổ răng khôn</p>
                        </div>

                        {/* Service 9 */}
                        <div className="group cursor-pointer">
                            <div className="relative overflow-hidden rounded-2xl aspect-square mb-3 bg-gray-100">
                                <img
                                    src="https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=400&h=400&fit=crop"
                                    alt="Răng sứ thẩm mỹ & veneer"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                            </div>
                            <p className="text-center text-sm font-semibold text-gray-900">Răng sứ thẩm mỹ &<br />veneer</p>
                        </div>

                        {/* Service 10 */}
                        <div className="group cursor-pointer">
                            <div className="relative overflow-hidden rounded-2xl aspect-square mb-3 bg-gray-100">
                                <img
                                    src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400&h=400&fit=crop&brightness=1.1"
                                    alt="Trám răng"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                            </div>
                            <p className="text-center text-sm font-semibold text-gray-900">Trám răng</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section - Parkway Style */}
            <section id="services" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Chăm Sóc Sức Khỏe Răng Miệng Toàn Diện</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Đa dạng dịch vụ nha khoa chuyên sâu với công nghệ hiện đại
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((service, index) => {
                            const Icon = service.icon;
                            const isFeatured = index < 2; // First 2 services are featured

                            return (
                                <div
                                    key={index}
                                    className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer"
                                >
                                    {/* Service Image */}
                                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
                                        {isFeatured && (
                                            <div className="absolute top-4 right-4 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                                🔥 Đang được yêu thích
                                            </div>
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className={`${service.color} rounded-2xl p-8 group-hover:scale-110 transition-transform duration-300`}>
                                                <Icon size={64} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Service Content */}
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                                            {service.title}
                                        </h3>
                                        <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                                            {service.description}
                                        </p>

                                        {/* Price hint */}
                                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                                            <div>
                                                <p className="text-xs text-gray-500">Giá từ</p>
                                                <p className="text-lg font-bold text-primary-600">
                                                    {index === 0 ? "500K" : index === 1 ? "2M" : index === 2 ? "5M" : index === 3 ? "15M" : index === 4 ? "800K" : "1.5M"}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1 text-yellow-500">
                                                <Star size={16} fill="currentColor" />
                                                <span className="text-sm font-semibold text-gray-700">4.9</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={scrollToBooking}
                                            className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all flex items-center justify-center gap-2 group-hover:shadow-lg"
                                        >
                                            Đặt lịch tư vấn
                                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* View All Services CTA */}
                    <div className="text-center mt-12">
                        <a
                            href="#services"
                            className="inline-flex items-center gap-2 px-8 py-4 border-2 border-primary-600 text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-all"
                        >
                            Xem tất cả dịch vụ
                            <span>→</span>
                        </a>
                    </div>
                </div>
            </section>

            {/* Booking Section */}
            <section id="booking" className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Đặt Lịch Khám</h2>
                        <p className="text-xl text-gray-600">
                            Điền thông tin bên dưới, chúng tôi sẽ liên hệ xác nhận lịch hẹn
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Họ và tên <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 text-gray-400" size={20} />
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="Nguyễn Văn A"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Số điện thoại <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="0912345678"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder="example@email.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Dịch vụ <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="service"
                                        value={formData.service}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">Chọn dịch vụ</option>
                                        {services.map((service, index) => (
                                            <option key={index} value={service.title}>
                                                {service.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Ngày khám <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3 text-gray-400" size={20} />
                                        <input
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleInputChange}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Giờ khám <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="time"
                                        value={formData.time}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">Chọn giờ</option>
                                        {timeSlots.map((time, index) => (
                                            <option key={index} value={time}>
                                                {time}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Ghi chú (không bắt buộc)
                                </label>
                                <div className="relative">
                                    <MessageSquare className="absolute left-3 top-3 text-gray-400" size={20} />
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        rows="4"
                                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="Mô tả triệu chứng hoặc yêu cầu đặc biệt..."
                                    ></textarea>
                                </div>
                            </div>

                            {formStatus.message && (
                                <div className={`p-4 rounded-lg ${formStatus.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                                    <p className="font-medium">{formStatus.message}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full py-4 bg-primary-600 text-white rounded-lg font-bold text-lg hover:bg-primary-700 transition-colors hover:shadow-lg"
                            >
                                Đặt Lịch Ngay
                            </button>

                            <p className="text-sm text-gray-500 text-center">
                                Bằng cách đặt lịch, bạn đồng ý với điều khoản sử dụng của chúng tôi
                            </p>
                        </form>
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section id="about" className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Tại Sao Chọn Chúng Tôi</h2>
                        <p className="text-xl text-gray-600">
                            Cam kết mang đến trải nghiệm chăm sóc răng miệng tốt nhất
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {benefits.map((benefit, index) => {
                            const Icon = benefit.icon;
                            return (
                                <div
                                    key={index}
                                    className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl hover:bg-primary-50 transition-colors"
                                >
                                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Icon size={24} className="text-primary-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                                            {benefit.title}
                                        </h3>
                                        <p className="text-gray-600">
                                            {benefit.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-16 bg-primary-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-bold mb-6">Liên Hệ Với Chúng Tôi</h2>
                            <p className="text-xl text-blue-100 mb-8">
                                Hãy để chúng tôi chăm sóc nụ cười của bạn. Liên hệ ngay để được tư vấn miễn phí!
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <p className="font-semibold">Địa chỉ</p>
                                        <p className="text-blue-100">123 Đường ABC, Quận 1, TP.HCM</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <p className="font-semibold">Điện thoại</p>
                                        <a href="tel:0123456789" className="text-blue-100 hover:text-white">
                                            (028) 1234 5678
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <p className="font-semibold">Email</p>
                                        <a href="mailto:info@dentalclinic.com" className="text-blue-100 hover:text-white">
                                            info@dentalclinic.com
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <p className="font-semibold">Giờ làm việc</p>
                                        <p className="text-blue-100">Thứ 2 - Thứ 7: 8:00 - 18:00</p>
                                        <p className="text-blue-100">Chủ nhật: 8:00 - 12:00</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
                                <h3 className="text-2xl font-bold mb-4">Đặt Lịch Nhanh</h3>
                                <p className="text-blue-100 mb-6">
                                    Nhận tư vấn miễn phí và ưu đãi lên đến 20% cho lần khám đầu tiên
                                </p>
                                <button
                                    onClick={scrollToBooking}
                                    className="px-8 py-4 bg-white text-primary-600 rounded-lg font-bold hover:bg-gray-100 transition-colors inline-flex items-center"
                                >
                                    <Calendar size={20} className="mr-2" />
                                    Đặt Lịch Ngay
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomeContent;