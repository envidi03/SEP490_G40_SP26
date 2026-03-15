import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import Breadcrumb from '../../components/ui/Breadcrumb';
import serviceService from '../../services/serviceService';
import { Loader2, Search } from 'lucide-react';

const ServicesList = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [parentService, setParentService] = useState(null);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const parentId = queryParams.get('parentId');

    useEffect(() => {
        const fetchContent = async () => {
            try {
                setLoading(true);
                setError(null);

                if (parentId) {
                    // Lấy danh sách gói dịch vụ (sub-services) của dịch vụ cha này
                    const [svcRes, subRes] = await Promise.all([
                        serviceService.getServiceById(parentId),
                        serviceService.getSubServicesByParent(parentId)
                    ]);
                    
                    setParentService(svcRes?.data || null);
                    setServices(subRes?.data || []);
                } else {
                    // Lấy danh sách toàn bộ dịch vụ cha (như cũ)
                    setParentService(null);
                    const response = await serviceService.getAllServices({
                        limit: 100,
                        page: 1,
                        filter: 'AVAILABLE',
                        search: search || undefined,
                    });
                    const availableServices = (response?.data || []).filter(s => s.status === 'AVAILABLE');
                    setServices(availableServices);
                }
            } catch (err) {
                setError('Không thể tải danh sách dịch vụ. Vui lòng thử lại sau.');
                console.error('Fetch services list error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [search, parentId]);

    return (
        <PublicLayout>
            <div className="bg-gray-50 min-h-screen py-8">
                {/* Breadcrumb */}
                <Breadcrumb
                    items={[
                        { label: 'Trang chủ', path: '/' },
                        { label: 'Dịch vụ', path: parentId ? '/services' : undefined },
                        parentId && parentService ? { label: parentService.service_name } : null
                    ].filter(Boolean)}
                />

                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {parentId && parentService ? `Gói dịch vụ: ${parentService.service_name}` : 'Dịch vụ tại DCMS'}
                            </h1>
                            <p className="text-gray-600 mt-2">
                                {parentId && parentService 
                                    ? `Khám phá các lựa chọn đa dạng cho dịch vụ ${parentService.service_name}`
                                    : 'Đội ngũ bác sĩ tận tâm, công nghệ hiện đại cho nụ cười hoàn mỹ'}
                            </p>
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-full md:max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Tìm kiếm dịch vụ..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900"
                            />
                        </div>
                    </div>

                    {/* Content Section */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-12 h-12 animate-spin text-primary-600 mb-4" />
                            <p className="text-gray-500 font-medium">Đang tải danh sách dịch vụ...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                            <div className="text-red-500 text-5xl mb-4">⚠️</div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Đã có lỗi xảy ra</h2>
                            <p className="text-gray-600 mb-6">{error}</p>
                            <button
                                onClick={() => setSearch(search)}
                                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                            >
                                Thử lại
                            </button>
                        </div>
                    ) : services.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy dịch vụ</h2>
                            <p className="text-gray-600">
                                {search
                                    ? `Chúng tôi không tìm thấy kết quả nào phù hợp với "${search}"`
                                    : 'Hiện chưa có dịch vụ nào được đăng ký.'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {services.map((item) => (
                                <Link
                                    key={item._id}
                                    to={parentId ? `/service/${item._id}?type=package` : `/services?parentId=${item._id}`}
                                    className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col"
                                >
                                    <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
                                        <img
                                            src={item.icon || item.image || 'https://via.placeholder.com/400x300.png?text=Service'}
                                            alt={item.sub_service_name || item.service_name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300.png?text=Service'; }}
                                        />
                                        <div className="absolute top-3 right-3">
                                            <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary-700 shadow-sm">
                                                {item.duration ? `${item.duration} phút` : 'Tư vấn'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">
                                            {item.sub_service_name || item.service_name}
                                        </h3>
                                        <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">
                                            {item.description || 'Chăm sóc sức khỏe răng miệng chuyên nghiệp với công nghệ hiện đại nhất hiện nay.'}
                                        </p>

                                        <div className="pt-4 border-t border-gray-50 flex items-center justify-between mt-auto">
                                            <span className="text-primary-600 font-bold">
                                                {parentId 
                                                    ? (item.min_price === item.max_price ? `${new Intl.NumberFormat('vi-VN').format(item.min_price)}đ` : `${new Intl.NumberFormat('vi-VN').format(item.min_price)}đ - ${new Intl.NumberFormat('vi-VN').format(item.max_price)}đ`)
                                                    : (item.price ? `${new Intl.NumberFormat('vi-VN').format(item.price)}đ` : 'Liên hệ')
                                                }
                                            </span>
                                            <span className="text-sm font-medium text-primary-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                                {parentId ? 'Chi tiết' : 'Xem các gói'} <span>→</span>
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Call to Action */}
                    {!loading && !error && (
                        <div className="mt-16 bg-gradient-to-r from-[#3b4a7a] to-[#5a6a94] rounded-3xl p-8 md:p-12 text-center text-white shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 text-8xl">🦷</div>
                            <div className="relative z-10">
                                <h2 className="text-2xl md:text-3xl font-bold mb-4">Bạn cần tư vấn lộ trình điều trị riêng?</h2>
                                <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                                    Đừng ngần ngại liên hệ với đội ngũ bác sĩ của chúng tôi để được thăm khám và tư vấn giải pháp phù hợp nhất cho tình trạng của bạn.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <Link
                                        to="/book-appointment"
                                        className="px-8 py-3.5 bg-white text-primary-700 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg w-full sm:w-auto text-lg"
                                    >
                                        Đặt lịch hẹn ngay
                                    </Link>
                                    <a
                                        href="tel:19008059"
                                        className="px-8 py-3.5 border-2 border-white/30 text-white rounded-xl font-bold hover:bg-white/10 transition-colors w-full sm:w-auto text-lg"
                                    >
                                        Hotline: 1900 8059
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
};

export default ServicesList;
