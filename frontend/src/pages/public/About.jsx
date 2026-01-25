import { useNavigate } from "react-router-dom";
import PublicLayout from "../../components/layout/PublicLayout";
import Breadcrumb from "../../components/ui/Breadcrumb";
import WhyChooseUs from "../../components/features/home/components/WhyChooseUs";
import DoctorsTeam from "../../components/features/home/components/DoctorsTeam";
import { Award, Users, Smile, Calendar, Clock, MapPin } from "lucide-react";

const About = () => {
    const navigate = useNavigate();

    const stats = [
        { label: "Năm kinh nghiệm", value: "15+", icon: Award },
        { label: "Bệnh nhân hài lòng", value: "10k+", icon: Smile },
        { label: "Đội ngũ nhân sự", value: "50+", icon: Users },
        { label: "Chi nhánh", value: "03", icon: MapPin },
    ];

    return (
        <PublicLayout>
            <div className="bg-white">
                {/* Header & Breadcrumb */}
                <div className="bg-gray-50 py-8">
                    <Breadcrumb items={[
                        { label: 'Trang chủ', path: '/' },
                        { label: 'Giới thiệu' }
                    ]} />
                    <div className="max-w-7xl mx-auto px-4 mt-6 text-center">
                        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                            Về Chúng Tôi
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Hành trình kiến tạo nụ cười hoàn hảo và sức khỏe răng miệng bền vững cho cộng đồng Việt Nam.
                        </p>
                    </div>
                </div>

                {/* Mission & Vision Section */}
                <section className="py-16 md:py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="relative">
                                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                                    <img
                                        src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=2068&auto=format&fit=crop"
                                        alt="Modern Dental Clinic"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-lg max-w-xs hidden md:block">
                                    <p className="text-primary-600 font-bold text-lg mb-1">Thiết bị hiện đại</p>
                                    <p className="text-sm text-gray-600">Đầu tư công nghệ tiên tiến nhất thế giới</p>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-6">Sứ Mệnh Của DCMS</h2>
                                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                    Tại DCMS, chúng tôi không chỉ điều trị răng miệng, chúng tôi chăm sóc nụ cười của bạn. Sứ mệnh của chúng tôi là mang đến dịch vụ nha khoa chất lượng cao, an toàn và thẩm mỹ nhất cho khách hàng.
                                </p>
                                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                    Với phương châm <span className="font-semibold text-primary-600">"Tận tâm - Chuyên nghiệp - Hiện đại"</span>, chúng tôi không ngừng nỗ lực nâng cao tay nghề và cập nhật công nghệ mới nhất để mỗi khách hàng đến với DCMS đều cảm thấy hài lòng và an tâm.
                                </p>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                <Award size={16} />
                                            </div>
                                            Chất lượng chuẩn quốc tế
                                        </h3>
                                        <p className="text-sm text-gray-600">Quy trình điều trị theo tiêu chuẩn nha khoa quốc tế.</p>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                <Clock size={16} />
                                            </div>
                                            Phục vụ 24/7
                                        </h3>
                                        <p className="text-sm text-gray-600">Luôn sẵn sàng hỗ trợ trong mọi tình huống khẩn cấp.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="bg-primary-600 py-16 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                            {stats.map((stat, idx) => {
                                const Icon = stat.icon;
                                return (
                                    <div key={idx} className="p-4">
                                        <div className="w-12 h-12 mx-auto bg-white/20 rounded-lg flex items-center justify-center mb-4 backdrop-blur-sm">
                                            <Icon size={24} className="text-white" />
                                        </div>
                                        <div className="text-4xl font-bold mb-2">{stat.value}</div>
                                        <div className="text-primary-100 font-medium">{stat.label}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Values Section (Reusing WhyChooseUs) */}
                <WhyChooseUs />

                {/* Team Section (Reusing DoctorsTeam) */}
                <DoctorsTeam />

                {/* CTA Section */}
                <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                    <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Sẵn sàng cho nụ cười rạng rỡ?</h2>
                        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                            Đặt lịch hẹn ngay hôm nay để được tư vấn và thăm khám miễn phí cùng đội ngũ chuyên gia hàng đầu.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => navigate('/book-appointment')}
                                className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-primary-600/30 flex items-center justify-center gap-2"
                            >
                                <Calendar size={20} />
                                Đặt lịch ngay
                            </button>
                            <button
                                onClick={() => navigate('/contact')}
                                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-bold text-lg transition-all backdrop-blur-sm flex items-center justify-center gap-2"
                            >
                                <Clock size={20} />
                                Giờ làm việc
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </PublicLayout>
    );
}

export default About;
