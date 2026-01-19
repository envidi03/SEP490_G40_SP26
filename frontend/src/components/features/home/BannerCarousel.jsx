import {
    ChevronLeft, ChevronRight
} from 'lucide-react';
import { useState, useEffect } from 'react';
const BannerCarousel = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Banner slides data
    const bannerSlides = [
        {
            badge: '✨ Gói chăm sóc mới',
            title: 'Gói chăm sóc',
            titleHighlight: 'Răng miệng',
            titleEnd: 'cho gia đình',
            subtitle: 'An tâm hôm nay, răng khỏe mai sau',
            image: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=600&h=500&fit=crop',
            bgImage: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=1200&h=400&fit=crop',
            promoTag: '🎉 Giảm 20% hôm nay!'
        },
        {
            badge: '🦷 Nha khoa thẩm mỹ',
            title: 'Nụ cười rạng rỡ',
            titleHighlight: 'Tự tin trọn đời',
            titleEnd: '',
            subtitle: 'Công nghệ tẩy trắng răng tiên tiến nhất',
            image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&h=500&fit=crop',
            bgImage: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=1200&h=400&fit=crop',
            promoTag: '⚡ Ưu đãi đặc biệt!'
        },
        {
            badge: '👨‍⚕️ Đội ngũ chuyên nghiệp',
            title: 'Bác sĩ giàu',
            titleHighlight: 'Kinh nghiệm',
            titleEnd: 'tận tâm',
            subtitle: 'Cam kết chất lượng dịch vụ tốt nhất',
            image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&h=500&fit=crop',
            bgImage: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1200&h=400&fit=crop',
            promoTag: '🎁 Tặng quà hấp dẫn!'
        }
    ];

    // Auto-play carousel
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
    };

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    const scrollToBooking = () => {
        document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="relative">
            {/* Slides */}
            {bannerSlides.map((slide, index) => (
                <div
                    key={index}
                    className={`transition-opacity duration-700 ${index === currentSlide ? 'opacity-100' : 'opacity-0 absolute inset-0'
                        }`}
                >
                    {/* Background Image with Overlay */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src={slide.bgImage}
                            alt="Banner Background"
                            className="w-full h-full object-cover opacity-30"
                        />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            {/* Left: Text Content */}
                            <div>
                                <span className="inline-block bg-primary-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-4">
                                    {slide.badge}
                                </span>
                                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                                    {slide.title}<br />
                                    <span className="text-primary-600">{slide.titleHighlight}</span>
                                    {slide.titleEnd && <><br />{slide.titleEnd}</>}
                                </h2>
                                <p className="text-lg text-gray-700 mb-6">
                                    {slide.subtitle}
                                </p>

                                {/* Benefits Icons - only show on first slide */}
                                {index === 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                                        <div className="text-center bg-white rounded-lg p-3 shadow-sm">
                                            <div className="text-2xl mb-1">🏥</div>
                                            <p className="text-xs text-gray-600">Tiêu chuẩn<br />nha khoa uy tín</p>
                                        </div>
                                        <div className="text-center bg-white rounded-lg p-3 shadow-sm">
                                            <div className="text-2xl mb-1">🏠</div>
                                            <p className="text-xs text-gray-600">Mái gói<br />cho cả gia đình</p>
                                        </div>
                                        <div className="text-center bg-white rounded-lg p-3 shadow-sm">
                                            <div className="text-2xl mb-1">👥</div>
                                            <p className="text-xs text-gray-600">Tiện lợi<br />khám khoáng</p>
                                        </div>
                                        <div className="text-center bg-white rounded-lg p-3 shadow-sm">
                                            <div className="text-2xl mb-1">👨‍⚕️</div>
                                            <p className="text-xs text-gray-600">Bác sĩ nhiều<br />kinh nghiệm</p>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={scrollToBooking}
                                    className="bg-primary-600 text-white px-8 py-4 rounded-lg font-bold text-base hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2"
                                >
                                    Đặt lịch tư vấn ngay
                                    <span>→</span>
                                </button>
                            </div>

                            {/* Right: Image */}
                            <div className="hidden md:block">
                                <img
                                    src={slide.image}
                                    alt={slide.title}
                                    className="rounded-2xl shadow-2xl w-full h-auto object-cover"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Promotional Tag */}
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg transform rotate-3 hidden lg:block z-30">
                        <p className="font-bold text-sm">{slide.promoTag}</p>
                    </div>
                </div>
            ))}

            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all hover:scale-110"
                aria-label="Previous slide"
            >
                <ChevronLeft size={24} />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all hover:scale-110"
                aria-label="Next slide"
            >
                <ChevronRight size={24} />
            </button>

            {/* Dots Indicators */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
                {bannerSlides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`transition-all ${index === currentSlide
                            ? 'w-8 bg-primary-600'
                            : 'w-2 bg-white/50 hover:bg-white/80'
                            } h-2 rounded-full`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default BannerCarousel;