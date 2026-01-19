import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Smile, Sparkles, Scissors, Wrench, Baby, Heart,
    CheckCircle, Award, Shield, Clock, Users, Star,
    Calendar, Phone, Mail, MapPin, User, MessageSquare
} from 'lucide-react';
import BannerCarousel from './BannerCarousel';
// Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './DoctorsSwiper.css';


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

            {/* Featured Services Gallery */}
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
                                    src="https://nhakhoaparkway.com/wp-content/uploads/2024/03/Nieng-rang-trong-suot.jpg"
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
                                    src="https://nhakhoaparkway.com/wp-content/uploads/2024/03/Nieng-rang-mac-cai_.jpg"
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
                                    src="https://nhakhoaparkway.com/wp-content/uploads/2024/04/Nha-tre%CC%89-em.jpg"
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
                                    src="https://nhakhoaparkway.com/wp-content/uploads/2024/03/Trong-rang-Implant-2.jpg"
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
                                    src="https://nhakhoaparkway.com/wp-content/uploads/2024/03/Lay-cao-rang.jpg"
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
                                    src="https://nhakhoaparkway.com/wp-content/uploads/2024/03/Nieng-rang-trong-suot-Clear-correct_.jpg"
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
                                    src="https://nhakhoaparkway.com/wp-content/uploads/2024/03/Nieng-rang-Mac-cai-truyen-thong.jpg"
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
                                    src="https://nhakhoaparkway.com/wp-content/uploads/2024/01/Nho%CC%82%CC%89-ra%CC%86ng-kho%CC%82n.png"
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
                                    src="https://nhakhoaparkway.com/wp-content/uploads/2024/03/Tay-trang-rang.jpg"
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
                                    src="https://nhakhoaparkway.com/wp-content/uploads/2024/03/Tram-rang.jpg"
                                    alt="Trám răng"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                            </div>
                            <p className="text-center text-sm font-semibold text-gray-900">Trám răng</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Services - "Dịch vụ đang được yêu thích" */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Dịch vụ đang được yêu thích</h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Service 1: Trám răng */}
                        <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group border border-gray-100">
                            <div className="relative h-56 overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&h=400&fit=crop"
                                    alt="Trám răng mặt nhai"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Trám răng mặt nhai</h3>
                                <p className="text-sm text-gray-600 mb-4">Nha khoa tổng quát</p>
                                <p className="text-lg font-bold text-primary-600 mb-4">350.000đ - 450.000đ</p>
                                <button className="w-full py-3 border-2 border-primary-600 text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-all">
                                    Xem chi tiết
                                </button>
                            </div>
                        </div>

                        {/* Service 2: Tẩy trắng răng */}
                        <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group border border-gray-100">
                            <div className="relative h-56 overflow-hidden">
                                <img
                                    src="https://nhakhoaparkway.com/wp-content/uploads/2024/02/Ta%CC%82%CC%89y-tra%CC%86%CC%81ng-3-1536x864.png"
                                    alt="Tẩy trắng răng cấp tốc Express"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Tẩy trắng răng cấp tốc Express</h3>
                                <p className="text-sm text-gray-600 mb-4">Nha khoa thẩm mỹ</p>
                                <p className="text-lg font-bold text-primary-600 mb-4">1.250.000đ - 1.400.000đ</p>
                                <button className="w-full py-3 border-2 border-primary-600 text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-all">
                                    Xem chi tiết
                                </button>
                            </div>
                        </div>

                        {/* Service 3: Invisalign - WITH DISCOUNT */}
                        <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group border border-gray-100">
                            <div className="relative h-56 overflow-hidden">
                                <div className="absolute top-4 left-4 z-10 bg-red-500 text-white px-3 py-1 rounded-md text-sm font-bold">
                                    Giảm 35%
                                </div>
                                <img
                                    src="https://nhakhoaparkway.com/wp-content/uploads/2024/02/Go%CC%81i-nie%CC%82%CC%80ng-ra%CC%86ng-trong-suo%CC%82%CC%81t-Comprehensive-3-na%CC%86m-1536x1024.jpg"
                                    alt="Gói niềng trong suốt Invisalign Comprehensive 3 năm"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Gói niềng trong suốt Invisalign Comprehensive 3 năm</h3>
                                <p className="text-sm text-gray-600 mb-4">Niềng răng trong suốt invisalign</p>
                                <div className="mb-4">
                                    <p className="text-sm text-gray-400 line-through">119.000.000đ - 125.000.000đ</p>
                                    <p className="text-lg font-bold text-red-600">77.350.000đ - 79.300.000đ</p>
                                </div>
                                <button className="w-full py-3 border-2 border-primary-600 text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-all">
                                    Xem chi tiết
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Doctors Team Section - "Gặp gỡ đội ngũ bác sĩ"  */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                            Gặp gỡ đội ngũ bác sĩ răng hàm mặt giàu kinh nghiệm
                        </h2>
                        <p className="text-lg text-gray-600 mt-4 max-w-3xl mx-auto">
                            Đội ngũ bác sĩ có trên 7 năm kinh nghiệm, áp dụng quy trình điều trị tiên tiến nhất cho bạn và gia đình
                        </p>
                    </div>

                    {/* Swiper Carousel for Doctors */}
                    <Swiper
                        modules={[Navigation, Pagination, Autoplay]}
                        spaceBetween={24}
                        slidesPerView={1}
                        navigation
                        pagination={{ clickable: true }}
                        autoplay={{ delay: 5000, disableOnInteraction: false }}
                        breakpoints={{
                            640: { slidesPerView: 1 },
                            1024: { slidesPerView: 2 }
                        }}
                        className="doctors-swiper"
                    >
                        {/* Doctor 1 - Horizontal Card */}
                        <SwiperSlide>
                            <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group h-full">
                                <div className="flex flex-col sm:flex-row h-full">
                                    {/* Doctor Photo - Left */}
                                    <div className="relative w-full sm:w-48 h-64 sm:h-auto overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
                                        <img
                                            src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=400&fit=crop&crop=faces"
                                            alt="BS. Phạm Thị Hà Xuyên"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>

                                    {/* Doctor Info - Right */}
                                    <div className="p-6 flex-1">
                                        <div className="mb-3">
                                            <span className="inline-block bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold">
                                                BS.
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-3">Phạm Thị Hà Xuyên</h3>
                                        <ul className="text-sm text-gray-600 space-y-2 mb-4">
                                            <li>• Bác sĩ răng hàm mặt</li>
                                            <li>• Tốt nghiệp Đại học Y Dược TP.HCM (2012)</li>
                                            <li>• Chứng chỉ Nha khoa thẩm mỹ - Hàn Quốc (2018)</li>
                                            <li>• 10+ năm kinh nghiệm lâm sàng</li>
                                            <li>• Chuyên về: Răng sứ thẩm mỹ, Veneer, Tẩy trắng răng</li>
                                        </ul>
                                        <button className="text-primary-600 font-semibold hover:text-primary-700 text-sm">
                                            Xem chi tiết →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>

                        {/* Doctor 2 - Horizontal Card */}
                        <SwiperSlide>
                            <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group h-full">
                                <div className="flex flex-col sm:flex-row h-full">
                                    {/* Doctor Photo - Left */}
                                    <div className="relative w-full sm:w-48 h-64 sm:h-auto overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
                                        <img
                                            src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=300&h=400&fit=crop&crop=faces"
                                            alt="BS. Nguyễn Xuân Nhi"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>

                                    {/* Doctor Info - Right */}
                                    <div className="p-6 flex-1">
                                        <div className="mb-3">
                                            <span className="inline-block bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold">
                                                BS.
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-3">Nguyễn Xuân Nhi</h3>
                                        <ul className="text-sm text-gray-600 space-y-2 mb-4">
                                            <li>• Bác sĩ răng hàm mặt</li>
                                            <li>• Tốt nghiệp Đại học Y Hà Nội (2014)</li>
                                            <li>• Chứng chỉ Niềng răng Invisalign - Mỹ (2017)</li>
                                            <li>• 8+ năm kinh nghiệm lâm sàng</li>
                                            <li>• Chuyên về: Niềng răng trong suốt, Chỉnh nha</li>
                                        </ul>
                                        <button className="text-primary-600 font-semibold hover:text-primary-700 text-sm">
                                            Xem chi tiết →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>

                        {/* Doctor 3 - Horizontal Card */}
                        <SwiperSlide>
                            <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group h-full">
                                <div className="flex flex-col sm:flex-row h-full">
                                    {/* Doctor Photo - Left */}
                                    <div className="relative w-full sm:w-48 h-64 sm:h-auto overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
                                        <img
                                            src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=400&fit=crop&crop=faces"
                                            alt="BS. Trần Minh Tuấn"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>

                                    {/* Doctor Info - Right */}
                                    <div className="p-6 flex-1">
                                        <div className="mb-3">
                                            <span className="inline-block bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold">
                                                BS.
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-3">Trần Minh Tuấn</h3>
                                        <ul className="text-sm text-gray-600 space-y-2 mb-4">
                                            <li>• Bác sĩ răng hàm mặt</li>
                                            <li>• Tốt nghiệp ĐH Y Dược TP.HCM (2010)</li>
                                            <li>• Chứng chỉ Cấy ghép Implant - Đức (2015)</li>
                                            <li>• 12+ năm kinh nghiệm lâm sàng</li>
                                            <li>• Chuyên về: Cấy ghép Implant, Phục hồi răng</li>
                                        </ul>
                                        <button className="text-primary-600 font-semibold hover:text-primary-700 text-sm">
                                            Xem chi tiết →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>

                        {/* Doctor 4 - Horizontal Card */}
                        <SwiperSlide>
                            <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group h-full">
                                <div className="flex flex-col sm:flex-row h-full">
                                    {/* Doctor Photo - Left */}
                                    <div className="relative w-full sm:w-48 h-64 sm:h-auto overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
                                        <img
                                            src="https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=300&h=400&fit=crop&crop=faces"
                                            alt="BS. Lê Thị Mai"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>

                                    {/* Doctor Info - Right */}
                                    <div className="p-6 flex-1">
                                        <div className="mb-3">
                                            <span className="inline-block bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold">
                                                BS.
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-3">Lê Thị Mai</h3>
                                        <ul className="text-sm text-gray-600 space-y-2 mb-4">
                                            <li>• Bác sĩ răng hàm mặt</li>
                                            <li>• Tốt nghiệp ĐH Y Phạm Ngọc Thạch (2015)</li>
                                            <li>• Chứng chỉ Nha khoa trẻ em - Singapore (2019)</li>
                                            <li>• 7+ năm kinh nghiệm lâm sàng</li>
                                            <li>• Chuyên về: Nha khoa trẻ em, Dự phòng răng miệng</li>
                                        </ul>
                                        <button className="text-primary-600 font-semibold hover:text-primary-700 text-sm">
                                            Xem chi tiết →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    </Swiper>

                    {/* View All Doctors CTA */}
                    <div className="text-center mt-12">
                        <button className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all shadow-md hover:shadow-lg">
                            Xem tất cả bác sĩ
                            <span>→</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Booking Section */}
            {/* <section id="booking" className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
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
            </section > */}

            {/* Why Choose Us Section */}
            < section id="about" className="py-16 bg-white" >
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
            </section >

            {/* Contact Section */}
            < section id="contact" className="py-16 bg-primary-600 text-white" >
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
            </section >
        </div >
    );
};

export default HomeContent;