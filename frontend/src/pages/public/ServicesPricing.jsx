import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import Breadcrumb from '../../components/ui/Breadcrumb';
import serviceService from '../../services/serviceService';

// Helper: format số tiền VND
const formatPrice = (price) => {
    if (price === null || price === undefined) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(price);
};

// Helper: convert service name to URL slug
const toUrlFriendly = (name) => {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
};

// Loading skeleton row
const SkeletonRow = () => (
    <tr className="border-b border-gray-200 animate-pulse">
        <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-3/4" /></td>
        <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-1/2" /></td>
        <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-1/4" /></td>
        <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-20 mx-auto" /></td>
    </tr>
);

const ServicesPricing = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedServiceId, setSelectedServiceId] = useState('all');
    const [dropdownSearch, setDropdownSearch] = useState('');
    const dropdownRef = useRef(null);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch toàn bộ services từ API (không phân trang, lấy limit lớn)
    useEffect(() => {
        const fetchServices = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await serviceService.getAllServices({
                    limit: 100,
                    page: 1,
                    filter: 'AVAILABLE',
                    search: search || undefined,
                });
                // response từ apiClient đã unwrap .data (interceptor trả response.data)
                // shape: { status, data: [...], pagination: {...} }
                const availableServices = (response?.data || []).filter(s => s.status === 'AVAILABLE');
                setServices(availableServices);
            } catch (err) {
                setError('Không thể tải danh sách dịch vụ. Vui lòng thử lại sau.');
                console.error('Fetch services error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, [search]);

    // Lọc trên client theo search nếu cần (cho bảng)
    const filteredServices = services.filter((s) => {
        const matchesSearch = s.service_name?.toLowerCase().includes(search.toLowerCase());
        const matchesSelected = selectedServiceId === 'all' || s._id === selectedServiceId;
        return matchesSearch && matchesSelected;
    });

    // Lọc danh sách dịch vụ cha trong dropdown
    const dropdownFilteredServices = services.filter(s => 
        s.service_name?.toLowerCase().includes(dropdownSearch.toLowerCase())
    );

    const selectedServiceName = selectedServiceId === 'all' 
        ? 'Tất cả dịch vụ' 
        : services.find(s => s._id === selectedServiceId)?.service_name || 'Tất cả dịch vụ';

    return (
        <PublicLayout>
            <div className="bg-gray-50 py-8">
                {/* Breadcrumb */}
                <Breadcrumb
                    items={[
                        { label: 'Trang chủ', path: '/' },
                        { label: 'Bảng giá dịch vụ' },
                    ]}
                />

                <div className="max-w-7xl mx-auto px-4">
                    {/* Title */}
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                        Bảng giá dịch vụ nha khoa mới nhất 2025
                    </h1>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
                        <span className="text-gray-700 font-medium min-w-[120px]">Chọn dịch vụ</span>
                        
                        <div className="relative flex-1 w-full sm:max-w-md" ref={dropdownRef}>
                            {/* Dropdown Trigger */}
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="w-full flex items-center justify-between px-6 py-3 bg-white border border-gray-200 rounded-full shadow-sm hover:border-primary-400 transition-all text-left"
                            >
                                <span className="text-gray-800 font-medium">{selectedServiceName}</span>
                                <svg 
                                    className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {isOpen && (
                                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="p-3 border-b border-gray-50">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Tìm kiếm dịch vụ..."
                                                value={dropdownSearch}
                                                onChange={(e) => setDropdownSearch(e.target.value)}
                                                autoFocus
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm outline-none"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="max-h-72 overflow-y-auto py-2 px-2 custom-scrollbar">
                                        <button
                                            onClick={() => {
                                                setSelectedServiceId('all');
                                                setIsOpen(false);
                                                setDropdownSearch('');
                                            }}
                                            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors mb-1 ${
                                                selectedServiceId === 'all' 
                                                    ? 'bg-primary-600 text-white font-medium' 
                                                    : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            Tất cả dịch vụ
                                        </button>
                                        
                                        {dropdownFilteredServices.map((s) => (
                                            <button
                                                key={s._id}
                                                onClick={() => {
                                                    setSelectedServiceId(s._id);
                                                    setIsOpen(false);
                                                    setDropdownSearch('');
                                                }}
                                                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors mb-1 ${
                                                    selectedServiceId === s._id 
                                                        ? 'bg-primary-600 text-white font-medium' 
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                {s.service_name}
                                            </button>
                                        ))}

                                        {dropdownFilteredServices.length === 0 && (
                                            <div className="px-4 py-6 text-center text-gray-500 text-sm italic">
                                                Không tìm thấy dịch vụ nào
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Tables Section */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Loading State */}
                            {loading && (
                                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                    <div className="bg-[#3b4a7a] text-white px-4 py-3">
                                        <div className="h-5 bg-blue-400 rounded w-1/4 animate-pulse" />
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-[#5a6a94] text-white text-sm">
                                                <tr>
                                                    <th className="px-4 py-2 text-left font-medium">Tên dịch vụ</th>
                                                    <th className="px-4 py-2 text-left font-medium">Giá</th>
                                                    <th className="px-4 py-2 text-left font-medium w-24">Thời gian</th>
                                                    <th className="px-4 py-2 text-center font-medium w-20"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[...Array(6)].map((_, i) => (
                                                    <SkeletonRow key={i} />
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Error State */}
                            {!loading && error && (
                                <div className="bg-white rounded-lg shadow-sm overflow-hidden p-12 text-center">
                                    <div className="text-red-500 mb-2 text-2xl">⚠️</div>
                                    <p className="text-red-600 font-medium">{error}</p>
                                    <button
                                        onClick={() => setSearch(search)}
                                        className="mt-3 text-sm text-primary-600 hover:underline"
                                    >
                                        Thử lại
                                    </button>
                                </div>
                            )}

                            {/* Empty State */}
                            {!loading && !error && filteredServices.length === 0 && (
                                <div className="bg-white rounded-lg shadow-sm overflow-hidden p-12 text-center">
                                    <div className="text-gray-400 text-3xl mb-2">🦷</div>
                                    <p className="text-gray-500">
                                        {search
                                            ? `Không tìm thấy dịch vụ nào với từ khóa "${search}"`
                                            : 'Chưa có dịch vụ nào được đăng ký'}
                                    </p>
                                </div>
                            )}

                            {/* Data Tables */}
                            {!loading && !error &&
                                filteredServices.map((service, serviceIdx) => {
                                    // Use sub_services_data if available, otherwise use the service itself as a single row
                                    const rows = service.sub_services_data && service.sub_services_data.length > 0 
                                        ? service.sub_services_data 
                                        : [service];

                                    return (
                                        <div key={service._id || serviceIdx} className="bg-white rounded-lg shadow-sm overflow-hidden">
                                            {/* Table Header: Display Parent Service Name */}
                                            <div className="bg-[#3b4a7a] text-white px-4 py-3 flex items-center justify-between">
                                                <h2 className="font-semibold">{service.service_name}</h2>
                                                <span className="text-sm text-blue-200">
                                                    {rows.length} dịch vụ
                                                </span>
                                            </div>

                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead className="bg-[#5a6a94] text-white text-sm">
                                                        <tr>
                                                            <th className="px-4 py-2 text-left font-medium">Tên dịch vụ</th>
                                                            <th className="px-4 py-2 text-left font-medium">Giá</th>
                                                            <th className="px-4 py-2 text-left font-medium w-24">Thời gian</th>
                                                            <th className="px-4 py-2 text-center font-medium w-20"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {rows.map((row, rowIdx) => (
                                                            <tr
                                                                key={row._id || `${serviceIdx}-${rowIdx}`}
                                                                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                                                            >
                                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                                    <div className="flex items-center gap-2">
                                                                        {(row.icon || service.icon) && (
                                                                            <img
                                                                                src={row.icon || service.icon}
                                                                                alt=""
                                                                                className="w-8 h-8 rounded object-cover flex-shrink-0"
                                                                            />
                                                                        )}
                                                                        <span>{row.sub_service_name || row.service_name}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 text-sm font-semibold text-primary-700">
                                                                    {row.min_price !== undefined 
                                                                        ? (row.max_price 
                                                                            ? `${formatPrice(row.min_price)} - ${formatPrice(row.max_price)}`
                                                                            : formatPrice(row.min_price)
                                                                          )
                                                                        : formatPrice(row.price)
                                                                    }
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                                                                    {row.duration
                                                                        ? `${row.duration} phút`
                                                                        : '—'}
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <Link
                                                                        to={`/service/${row._id}?type=${service.sub_services_data?.length > 0 ? 'package' : 'service'}`}
                                                                        className="text-primary-600 hover:text-primary-700 font-medium text-sm hover:underline"
                                                                    >
                                                                        Chi tiết
                                                                    </Link>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-4">
                                {/* Clinic banner */}
                                <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                                    <div className="text-center p-6">
                                        <p className="text-gray-600 text-sm">Phòng khám nha khoa</p>
                                        <p className="text-gray-800 font-semibold">DCMS Dental Clinic</p>
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className="p-6">
                                    <h3 className="font-semibold text-gray-900 mb-4">Liên hệ tư vấn</h3>
                                    <div className="space-y-3">
                                        <a
                                            href="tel:19008059"
                                            className="flex items-center gap-3 text-gray-700 hover:text-primary-600 transition-colors"
                                        >
                                            <span className="text-2xl">📞</span>
                                            <div>
                                                <p className="text-sm text-gray-500">Hotline</p>
                                                <p className="font-semibold">1900 8059</p>
                                            </div>
                                        </a>
                                        <Link
                                            to="/book-appointment"
                                            className="block w-full text-center mt-4 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                                        >
                                            Đặt lịch ngay
                                        </Link>
                                        <button className="w-full px-6 py-3 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-semibold">
                                            Chat tư vấn
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Note */}
                    <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                        <p className="text-sm text-yellow-800">
                            <strong>Lưu ý:</strong> Giá dịch vụ có thể thay đổi tùy theo tình trạng
                            răng miệng và phương pháp điều trị cụ thể. Vui lòng liên hệ để được tư
                            vấn chi tiết và chính xác nhất.
                        </p>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default ServicesPricing;
