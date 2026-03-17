import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PublicLayout from "../../components/layout/PublicLayout";
import Breadcrumb from "../../components/ui/Breadcrumb";
import WhyChooseUs from "../../components/features/home/components/WhyChooseUs";
import DoctorsTeam from "../../components/features/home/components/DoctorsTeam";
import { Award, Users, Smile, Clock, MapPin, ChevronRight, Target, Heart, ShieldCheck } from "lucide-react";

const About = () => {
    const navigate = useNavigate();

    const stats = [
        { label: "Năm kinh nghiệm", value: "15+", icon: Award, color: "text-blue-500", bg: "bg-blue-50" },
        { label: "Bệnh nhân hài lòng", value: "10k+", icon: Smile, color: "text-green-500", bg: "bg-green-50" },
        { label: "Đội ngũ nhân sự", value: "50+", icon: Users, color: "text-purple-500", bg: "bg-purple-50" },
        { label: "Chi nhánh", value: "03", icon: MapPin, color: "text-orange-500", bg: "bg-orange-50" },
    ];

    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <PublicLayout>
            <div className="bg-white overflow-hidden">
                {/* ─── HERO SECTION ─── */}
                <section className="relative pt-8 pb-20 md:pt-12 md:pb-32 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-white to-transparent">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <Breadcrumb items={[
                            { label: 'Trang chủ', path: '/' },
                            { label: 'Giới thiệu' }
                        ]} />

                        <div className="mt-12 grid lg:grid-cols-2 gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                                className="relative z-10"
                            >
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-600 text-sm font-bold mb-6">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                                    </span>
                                    Hành trình 15 năm vươn tầm
                                </div>
                                <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
                                    Kiến Tạo <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-400">Nụ Cười</span><br />
                                    Vươn Tầm Thế Giới
                                </h1>
                                <p className="text-lg text-gray-600 mb-8 max-w-xl leading-relaxed">
                                    DCMS không chỉ là một phòng khám nha khoa, mà là nơi chúng tôi kết hợp giữa nghệ thuật thẩm mỹ và công nghệ y khoa tiên tiến để mang lại sự tự tin trọn vẹn cho từng khách hàng.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <button
                                        onClick={() => navigate('/book-appointment')}
                                        className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold shadow-lg shadow-primary-200 transition-all flex items-center gap-2 group"
                                    >
                                        Bắt đầu ngay <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* ─── MISSION & VISION SECTION ─── */}
                <section className="py-24 bg-gray-50/50">
                    <div className="max-w-4xl mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-primary-600 font-bold tracking-widest uppercase text-sm mb-4 text-center">
                                Mục tiêu của chúng tôi
                            </h2>

                            <h3 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-12 leading-tight text-center">
                                Sứ Mệnh <br />
                                <span className="text-gray-400">Vì Một Việt Nam Rạng Rỡ</span>
                            </h3>

                            <div className="space-y-8">
                                <div className="flex gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-white shadow-md rounded-xl flex items-center justify-center text-primary-600">
                                        <Target size={24} />
                                    </div>

                                    <div>
                                        <h4 className="text-xl font-bold text-gray-900 mb-2">
                                            Tầm nhìn chiến lược
                                        </h4>

                                        <p className="text-gray-600 leading-relaxed">
                                            Trở thành hệ thống nha khoa thẩm mỹ hàng đầu, nơi ứng dụng mọi
                                            tinh hoa công nghệ thế giới vào thực tế điều trị tại Việt Nam.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-white shadow-md rounded-xl flex items-center justify-center text-primary-600">
                                        <Heart size={24} />
                                    </div>

                                    <div>
                                        <h4 className="text-xl font-bold text-gray-900 mb-2">
                                            Giá trị nhân văn
                                        </h4>

                                        <p className="text-gray-600 leading-relaxed">
                                            Chúng tôi không chỉ chữa bệnh, chúng tôi thấu cảm. Mỗi nụ cười của
                                            bạn là nguồn động lực lớn nhất để chúng tôi hoàn thiện mỗi ngày.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* ─── REUSING COMPONENTS ─── */}
                <div className="relative">
                    <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-gray-50/50 to-transparent pointer-events-none"></div>
                    <WhyChooseUs />
                    <DoctorsTeam />
                </div>

                {/* ─── CTA SECTION ─── */}
                <section className="py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="relative rounded-[3rem] bg-gradient-to-br from-blue-50 via-indigo-50 to-primary-100 overflow-hidden px-8 py-20 text-center shadow-xl shadow-blue-100/50 border border-white">
                            {/* Animated Background Orbs */}
                            <div className="absolute -top-24 -left-24 w-80 h-80 bg-primary-200/40 rounded-full blur-[80px] animate-pulse"></div>
                            <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-indigo-200/40 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="relative z-10 max-w-2xl mx-auto"
                            >
                                <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                                    Sẵn Sàng Cho Một <br />
                                    <span className="text-primary-600">Diện Mạo Mới?</span>
                                </h2>
                                <p className="text-gray-600 text-lg mb-10 leading-relaxed font-medium">
                                    Giải pháp nha khoa toàn diện, tiết kiệm và cá nhân hóa đang chờ bạn. Hãy để DCMS đồng hành cùng nụ cười của bạn.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <button
                                        onClick={() => navigate('/book-appointment')}
                                        className="px-10 py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-primary-200 hover:scale-105 active:scale-95"
                                    >
                                        Đặt lịch tư vấn miễn phí
                                    </button>
                                    <button
                                        onClick={() => navigate('/contact')}
                                        className="px-10 py-5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-2xl font-bold text-lg transition-all shadow-sm hover:scale-105"
                                    >
                                        Liên hệ ngay
                                    </button>
                                </div>
                                <p className="mt-8 text-sm text-gray-400 font-medium">
                                    Mở cửa: Thứ 2 - Thứ 7 (8:00 - 20:00) | Chủ nhật (8:00 - 12:00)
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </section>
            </div>
        </PublicLayout>
    );
};

export default About;
