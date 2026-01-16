import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import '../styles/DoctorsSwiper.css';
import { doctorsTeamData } from '../../../../utils/mockData';

const DoctorsTeam = () => {
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
                    {doctorsTeamData.map((doctor, index) => (
                        <SwiperSlide key={index}>
                            <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group h-full">
                                <div className="flex flex-col sm:flex-row h-full">
                                    {/* Doctor Photo - Left */}
                                    <div className="relative w-full sm:w-48 h-64 sm:h-auto overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
                                        <img
                                            src={doctor.image}
                                            alt={`BS. ${doctor.name}`}
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
                                        <h3 className="text-xl font-bold text-gray-900 mb-3">{doctor.name}</h3>
                                        <ul className="text-sm text-gray-600 space-y-2 mb-4">
                                            {doctor.credentials.map((credential, idx) => (
                                                <li key={idx}>• {credential}</li>
                                            ))}
                                        </ul>
                                        <button className="text-primary-600 font-semibold hover:text-primary-700 text-sm">
                                            Xem chi tiết →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
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
    );
};

export default DoctorsTeam;
