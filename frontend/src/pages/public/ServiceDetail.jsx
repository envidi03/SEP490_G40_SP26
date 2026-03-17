import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import Breadcrumb from '../../components/ui/Breadcrumb';
import serviceService from '../../services/serviceService';
import { Phone, Calendar, ChevronLeft, Tag } from 'lucide-react';

// Format giá VND
const formatPrice = (price) => {
    if (price === null || price === undefined) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
};

const formatPriceRange = (min, max) => {
    if (min === null || min === undefined) return 'Liên hệ';
    if (!max || min === max) return formatPrice(min);
    return `${new Intl.NumberFormat('vi-VN').format(min)}đ - ${new Intl.NumberFormat('vi-VN').format(max)}đ`;
};

// Placeholder image khi không có ảnh
const PLACEHOLDER_IMG = 'https://placehold.co/600x450/e0e7ff/3b4a7a?text=D%E1%BB%8Bch+v%E1%BB%A5';

const ServiceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const type = queryParams.get('type'); // 'service' or 'package'

    const [service, setService] = useState(null);
    const [relatedServices, setRelatedServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImg, setSelectedImg] = useState(0);

    // Thumbnails: dùng icon service nếu có, bổ sung placeholder
    const getImages = (svc) => {
        const imgs = [];
        if (svc?.icon) imgs.push(svc.icon);
        // Thêm placeholders để giống gallery nếu chưa đủ 4 ảnh
        while (imgs.length < 1) imgs.push(PLACEHOLDER_IMG);
        return imgs;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                let detailRes;
                if (type === 'package') {
                    detailRes = await serviceService.getSubServiceById(id);
                }

                const detailData = detailRes?.data || null;
                if (detailData && type === 'package') {
                    // Map sub-service fields to match UI expectations
                    detailData.service_name = detailData.sub_service_name;

                    // Fetch related sub-services (same parent)
                    if (detailData.parent_id) {
                        const pId = detailData.parent_id._id || detailData.parent_id;
                        const relatedRes = await serviceService.getSubServicesByParent(pId.toString());
                        const allRelated = relatedRes?.data || [];
                        // Filter out current sub-service
                        setRelatedServices(allRelated.filter(s => s._id !== id).slice(0, 6));
                    }
                } else {
                    // Fallback or if type is not package (though user says always package now)
                    const listRes = await serviceService.getAllServices({ limit: 20, page: 1, filter: 'AVAILABLE' });
                    const all = listRes?.data || [];
                    setRelatedServices(all.filter((s) => s.status === 'AVAILABLE' && s._id !== id).slice(0, 6));
                }

                setService(detailData);
            } catch (err) {
                setError('Không tìm thấy dịch vụ.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchData();
    }, [id, type]);

    const images = getImages(service);

    /* ─── Loading ─── */
    if (loading) return (
        <PublicLayout>
            <div className="bg-white py-8 min-h-screen">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="h-4 bg-gray-200 rounded w-64 mb-6 animate-pulse" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-gray-200 rounded-xl aspect-square animate-pulse" />
                        <div className="space-y-4">
                            <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
                            <div className="h-20 bg-gray-200 rounded animate-pulse" />
                            <div className="h-12 bg-gray-200 rounded animate-pulse" />
                            <div className="h-12 bg-gray-200 rounded animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );

    /* ─── Error ─── */
    if (error || !service) return (
        <PublicLayout>
            <div className="bg-white py-16 min-h-screen flex flex-col items-center justify-center">
                <div className="text-5xl mb-4">😕</div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Không tìm thấy dịch vụ</h2>
                <p className="text-gray-500 mb-6">{error}</p>
                <Link to="/pricing" className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">
                    Xem bảng giá
                </Link>
            </div>
        </PublicLayout>
    );

    return (
        <PublicLayout>
            <div className="bg-white py-6 min-h-screen">
                <div className="max-w-6xl mx-auto px-4">

                    {/* Breadcrumb */}
                    <Breadcrumb items={[
                        { label: 'Trang chủ', path: '/' },
                        { label: 'Bảng giá dịch vụ', path: '/pricing' },
                        { label: service.service_name },
                    ]} />

                    {/* Page Title */}
                    <h1 className="text-xl md:text-2xl font-semibold text-primary-700 mt-4 mb-6">
                        {service.service_name}
                    </h1>

                    {/* ── Main 2-column layout ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">

                        {/* ─── LEFT: Image gallery ─── */}
                        <div>
                            {/* Main image */}
                            <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50 mb-3">
                                <img
                                    src={images[selectedImg] || PLACEHOLDER_IMG}
                                    alt={service.service_name}
                                    className="w-full object-contain aspect-[4/3]"
                                    onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
                                />
                            </div>

                            {/* Thumbnails (chỉ show nếu có nhiều hơn 1 ảnh) */}
                            {images.length > 1 && (
                                <div className="flex gap-2">
                                    {images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImg(idx)}
                                            className={`flex-1 rounded-lg overflow-hidden border-2 transition-all ${idx === selectedImg
                                                ? 'border-orange-400'
                                                : 'border-gray-200 hover:border-gray-400'
                                                }`}
                                        >
                                            <img
                                                src={img}
                                                alt=""
                                                className="w-full aspect-square object-cover"
                                                onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ─── RIGHT: Price + CTA ─── */}
                        <div className="flex flex-col gap-4">

                            {/* Price card */}
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                                {/* Badge */}
                                <div className="inline-flex items-center gap-1.5 bg-orange-400 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
                                    <Tag size={12} />
                                    Giá dịch vụ
                                </div>

                                {/* Price */}
                                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                                    {type === 'package'
                                        ? formatPriceRange(service.min_price, service.max_price)
                                        : formatPrice(service.price)
                                    }
                                </div>

                                {/* Note */}
                                <p className="text-xs text-gray-500 mb-4">
                                    *Tùy thuộc chỉ định của bác sĩ
                                </p>

                                {/* Meta info */}
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 border-t border-gray-200 pt-4">
                                    <div>
                                        <span className="font-medium">Đơn vị: </span>
                                        <span>Lần</span>
                                    </div>
                                    {service.duration && (
                                        <div>
                                            <span className="font-medium">Thời gian: </span>
                                            <span>{service.duration} phút</span>
                                        </div>
                                    )}
                                    <div>
                                        <span className="font-medium">Trạng thái: </span>
                                        <span className={service.status === 'AVAILABLE' ? 'text-green-600' : 'text-red-500'}>
                                            {service.status === 'AVAILABLE' ? 'Đang cung cấp' : 'Tạm ngưng'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* CTA Buttons */}
                            <a
                                href="tel:19008059"
                                className="flex items-center justify-center gap-2 bg-[#2d3e6e] hover:bg-[#1f2d52] text-white font-semibold py-4 px-6 rounded-xl transition-colors text-base"
                            >
                                <Phone size={18} />
                                Gọi ngay (Đặt hẹn, Tư vấn miễn phí)
                            </a>

                            <Link
                                to="/book-appointment"
                                state={{
                                    service: type === 'package' ? service.parent_id : service,
                                    subService: type === 'package' ? service : null
                                }}
                                className="flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-primary-700 font-semibold py-4 px-6 rounded-xl transition-colors border border-blue-200 text-base"
                            >
                                <Calendar size={18} />
                                Đặt lịch ngay
                            </Link>

                            {/* Back link */}
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors mt-1"
                            >
                                <ChevronLeft size={14} />
                                Quay lại
                            </button>
                        </div>
                    </div>

                    {/* ── Nội dung (description) ── */}
                    <div className="mb-12">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="w-1 h-6 bg-primary-600 rounded-full inline-block" />
                            Nội dung
                        </h2>
                        {service.description ? (
                            <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                                {service.description}
                            </div>
                        ) : (
                            <p className="text-gray-400 italic">
                                Chưa có mô tả chi tiết cho dịch vụ này. Vui lòng liên hệ để được tư vấn.
                            </p>
                        )}
                    </div>

                    {/* ── Related services ── */}
                    {relatedServices.length > 0 && (
                        <div className="border-t border-gray-100 pt-10">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <span className="w-1 h-6 bg-primary-600 rounded-full inline-block" />
                                Dịch vụ khác dành cho bạn
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {relatedServices.map((svc) => (
                                    <Link
                                        key={svc._id}
                                        to={`/service/${svc._id}?type=package`}
                                        className="group border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all"
                                    >
                                        {/* Image */}
                                        <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                                            <img
                                                src={svc.icon || svc.image || PLACEHOLDER_IMG}
                                                alt={svc.sub_service_name || svc.service_name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
                                            />
                                        </div>
                                        {/* Info */}
                                        <div className="p-3">
                                            <p className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-primary-600 transition-colors">
                                                {svc.sub_service_name || svc.service_name}
                                            </p>
                                            <span className="text-primary-600 text-xs font-medium mt-1 inline-block hover:underline">
                                                Xem chi tiết →
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </PublicLayout>
    );
};

export default ServiceDetail;
