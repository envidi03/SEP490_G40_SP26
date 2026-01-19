import { Calendar, Phone, Mail, MapPin, Clock } from 'lucide-react';

const ContactSection = () => {
    const scrollToBooking = () => {
        document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
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
    );
};

export default ContactSection;
