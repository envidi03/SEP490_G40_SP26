import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import '../styles/DoctorsSwiper.css';
import { Loader2 } from 'lucide-react';
import staffService from '../../../../services/staffService';

const DoctorsTeam = () => {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchDoctorsForHomepage = async () => {
            try {
                setLoading(true);
                // Call API with limit = 8 to show max 8 doctors on homepage
                const response = await staffService.getStaffs({
                    role_name: 'DOCTOR',
                    limit: 8,
                    page: 1
                });

                if (!isMounted) return;

                const allDoctors = response.data?.data || response.data || [];

                const formattedDoctors = allDoctors.map((doc) => ({
                    ...doc,
                    // Temporarily mock credentials since backend doesn't support them yet
                    credentials: [
                        'Chứng chỉ hành nghề khám bệnh, chữa bệnh',
                        'Chứng chỉ đào tạo liên tục chuyên ngành Nha khoa'
                    ]
                }));

                setDoctors(formattedDoctors);
            } catch (err) {
                console.error("Failed to fetch doctors for homepage:", err);
                if (isMounted) {
                    setError("Không thể tải danh sách bác sĩ. Vui lòng thử lại sau.");
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchDoctorsForHomepage();

        return () => { isMounted = false; };
    }, []);
    return (
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
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary-600 mb-4" />
                            <p className="text-gray-500">Đang tải danh sách bác sĩ...</p>
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-8">
                            <p className="text-red-500">{error}</p>
                        </div>
                    )}

                    {!loading && !error && doctors.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-500">Hiện tại chưa có dữ liệu bác sĩ nào.</p>
                        </div>
                    )}

                    {!loading && !error && doctors.map((doctor) => (
                        <SwiperSlide key={doctor._id || Math.random()}>
                            <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group h-full">
                                <div className="flex flex-col sm:flex-row h-full">
                                    <div className="relative w-full sm:w-48 h-64 sm:h-auto overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 flex-shrink-0 flex items-end justify-center">
                                        <img
                                            src={doctor.profile?.avatar_url || 'https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png'}
                                            alt={doctor.profile?.full_name || 'Bác sĩ'}
                                            className="w-[90%] h-auto object-cover object-bottom group-hover:scale-105 transition-transform duration-300"
                                            onError={(e) => { e.target.src = 'https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png'; }}
                                        />
                                    </div>

                                    {/* Doctor Info - Right */}
                                    <div className="p-6 flex-1 flex flex-col justify-center">
                                        <div className="mb-3">
                                            <span className="inline-block bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold">
                                                BS. RĂNG HÀM MẶT
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-3">{doctor.profile?.full_name || 'Bác sĩ'}</h3>
                                        <ul className="text-sm text-gray-600 space-y-2 mb-4">
                                            {doctor.credentials?.map((credential, idx) => (
                                                <li key={idx}>• {credential}</li>
                                            ))}
                                        </ul>
                                        <div className="mt-auto pt-4">
                                            <button
                                                onClick={() => navigate(`/doctor/${doctor._id}`)}
                                                className="text-primary-600 font-semibold hover:text-primary-700 text-sm transition-colors"
                                            >
                                                Xem chi tiết →
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>

                {/* View All Doctors CTA */}
                <div className="text-center mt-12">
                    <button
                        onClick={() => navigate('/doctors')}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-[#2d3e6e] text-white rounded-lg font-semibold hover:bg-[#1a2b5e] transition-all shadow-md hover:shadow-lg"
                    >
                        Xem tất cả bác sĩ
                        <span>→</span>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default DoctorsTeam;
