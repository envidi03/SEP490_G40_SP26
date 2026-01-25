import { useState } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import Breadcrumb from '../../components/ui/Breadcrumb';

// Helper function to convert service name to URL-friendly ID
const toUrlFriendly = (name) => {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
};

// Mock services data - organized by category
const servicesData = [
    {
        category: 'Niềng răng',
        services: [
            { name: 'Hàm duy trì Vivera', price: '4.130.000đ - 5.300.000đ', type: 'Lần' },
            { name: 'Gói niềng răng mắc cài kim loại tự động', price: '40.000.000đ - 58.000.000đ', type: 'Lần' },
            { name: 'Gói niềng răng mắc cài kim loại', price: '32.000.000đ - 48.000.000đ', type: 'Lần' },
            { name: 'Gói niềng trong suốt Essentials by Invisalign', price: '60.000.000đ - 71.000.000đ', type: 'Lần' },
            { name: 'Gói niềng răng trong suốt Invisalign Comprehensive (5 năm)', price: '127.000.000đ - 133.000.000đ', type: 'Lần', discount: '77.350.000đ - 79.300.000đ' },
            { name: 'Gói niềng răng trong suốt Invisalign Moderate', price: '77.000.000đ - 101.000.000đ', type: 'Lần' },
            { name: 'Dịch vụ niềng răng trong suốt Invisalign Lite', price: '58.000.000đ - 77.000.000đ', type: 'Lần' },
        ]
    },
    {
        category: 'Trồng răng Implant',
        services: [
            { name: 'Hệ thống Implant Straumann dòng BLT SLactive', price: '39.000.000đ', type: 'Lần' },
            { name: 'Hệ thống Implant Straumann dòng BLT SLA', price: '34.000.000đ', type: 'Lần' },
            { name: 'Hệ thống Implant Neodent dòng Acqua', price: '25.000.000đ - 27.000.000đ', type: 'Lần' },
            { name: 'Hệ thống Implant Dentium dòng Super Line', price: '15.900.000đ - 17.000.000đ', type: 'Lần' },
            { name: 'Cấy ghép Implant trọn gói Platinum Combo', price: '56.000.000đ - 59.000.000đ', type: 'Lần' },
            { name: 'Cấy ghép Implant trọn gói Gold Combo', price: '29.000.000đ - 33.000.000đ', type: 'Lần' },
            { name: 'Cấy ghép Implant trọn gói Silver Combo', price: '20.000.000đ - 30.000.000đ', type: 'Lần' },
        ]
    },
    {
        category: 'Nha khoa thẩm mỹ',
        services: [
            { name: 'Răng sứ Emax thẩm mỹ', price: '6.500.000đ - 7.000.000đ', type: 'Lần' },
            { name: 'Bọc sứ/Chụp sứ Zircad Prime/Lava (BH 10 năm)', price: '9.000.000đ - 11.000.000đ', type: 'Lần' },
            { name: 'Bọc sứ Lisi thẩm mỹ (BH 5 năm)', price: '10.000.000đ - 11.000.000đ', type: 'Lần' },
            { name: 'Dán sứ Veneer Emax thẩm mỹ (BH 5 năm)', price: '8.000.000đ', type: 'Lần' },
            { name: 'Trám răng bằng sứ Emax Inlay/Onlay (BH 5 năm)', price: '2.700.000đ - 5.300.000đ', type: 'Lần' },
            { name: 'Tẩy trắng răng Laser Express', price: '2.200.000đ - 2.500.000đ', type: 'Lần' },
            { name: 'Tẩy trắng răng Zoom Laser', price: 'Liên hệ', type: 'Lần' },
        ]
    },
    {
        category: 'Nha khoa tổng quát',
        services: [
            { name: 'Điều trị nha chu', price: '480.000đ - 1.600.000đ', type: 'Lần' },
            { name: 'Nhổ răng khôn', price: '950.000đ - 5.900.000đ', type: 'Lần' },
            { name: 'Nhổ răng thường', price: '290.000đ - 1.350.000đ', type: 'Lần' },
            { name: 'Điều trị tủy lại', price: '2.000.000đ - 4.000.000đ', type: 'Lần' },
            { name: 'Điều trị tủy', price: '800.000đ - 2.500.000đ', type: 'Lần' },
            { name: 'Lấy cao răng', price: '300.000đ - 400.000đ', type: 'Lần' },
            { name: 'Điều trị viêm lợi', price: '1.050.000đ - 1.200.000đ', type: 'Lần' },
            { name: 'Hàn trám răng sâu mặt nhai', price: '350.000đ - 450.000đ', type: 'Lần' },
            { name: 'Hàn trám có răng', price: '1.250.000đ - 1.400.000đ', type: 'Lần' },
        ]
    },
    {
        category: 'Nha khoa trẻ em',
        services: [
            { name: 'Gói đầu tư tương lai (1-18 tuổi)', price: '39.000.000đ', type: 'Lần' },
            { name: 'Gói định hình nụ cười', price: '25.000.000đ', type: 'Lần' },
            { name: 'Gói khởi đầu bảo vệ', price: '2.100.000đ', type: 'Lần' },
            { name: 'Gói chăm sóc trẻ thay răng theo năm', price: '2.100.000đ - 2.500.000đ', type: 'Lần' },
            { name: 'Gói tiền chỉnh nha bằng khay niềng Invisalign First', price: '74.000.000đ - 84.000.000đ', type: 'Lần' },
            { name: 'Hàn trám răng sữa', price: '159.000đ - 270.000đ', type: 'Lần' },
            { name: 'Nhổ răng sữa', price: '50.000đ - 210.000đ', type: 'Lần' },
        ]
    }
];

const ServicesPricing = () => {
    const [activeTab, setActiveTab] = useState('all');

    return (
        <PublicLayout>
            {/* Main Content */}
            <div className="bg-gray-50 py-8">
                {/* Breadcrumb */}
                <Breadcrumb items={[
                    { label: 'Trang chủ', path: '/' },
                    { label: 'Bảng giá dịch vụ' }
                ]} />

                {/* Content */}
                <div className="max-w-7xl mx-auto px-4">
                    {/* Title */}
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                        Bảng giá dịch vụ vụ làm răng mới nhất 2025
                    </h1>

                    {/* Dropdown Select */}
                    <div className="flex items-center gap-4 mb-6">
                        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                            Chọn dịch vụ
                        </label>
                        <select
                            value={activeTab}
                            onChange={(e) => setActiveTab(e.target.value)}
                            className="flex-1 max-w-md px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-900"
                        >
                            <option value="all">Tất cả dịch vụ</option>
                            <option value="nieng-rang">Niềng răng</option>
                            <option value="implant">Trồng răng Implant</option>
                            <option value="tham-my">Nha khoa thẩm mỹ</option>
                            <option value="tong-quat">Nha khoa tổng quát</option>
                            <option value="tre-em">Nha khoa trẻ em</option>
                        </select>
                    </div>

                    {/* Content Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Table Section */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                {servicesData
                                    .filter(categoryData => {
                                        if (activeTab === 'all') return true;
                                        const categoryMap = {
                                            'nieng-rang': 'Niềng răng',
                                            'implant': 'Trồng răng Implant',
                                            'tham-my': 'Nha khoa thẩm mỹ',
                                            'tong-quat': 'Nha khoa tổng quát',
                                            'tre-em': 'Nha khoa trẻ em'
                                        };
                                        return categoryData.category === categoryMap[activeTab];
                                    })
                                    .map((categoryData, idx) => (
                                        <div key={idx}>
                                            {/* Category Header */}
                                            <div className="bg-[#3b4a7a] text-white px-4 py-3">
                                                <h2 className="font-semibold">{categoryData.category}</h2>
                                            </div>

                                            {/* Services Table */}
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead className="bg-[#5a6a94] text-white text-sm">
                                                        <tr>
                                                            <th className="px-4 py-2 text-left font-medium">Dịch vụ</th>
                                                            <th className="px-4 py-2 text-left font-medium">Giá</th>
                                                            <th className="px-4 py-2 text-left font-medium w-20">Loại</th>
                                                            <th className="px-4 py-2 text-center font-medium w-24"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {categoryData.services.map((service, serviceIdx) => (
                                                            <tr
                                                                key={serviceIdx}
                                                                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                                                            >
                                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                                    {service.name}
                                                                    {service.discount && (
                                                                        <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded">
                                                                            Giảm giá
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm">
                                                                    {service.discount ? (
                                                                        <div>
                                                                            <span className="line-through text-gray-400 text-xs block">
                                                                                {service.price}
                                                                            </span>
                                                                            <span className="text-red-600 font-semibold">
                                                                                {service.discount}
                                                                            </span>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-gray-900 font-medium">
                                                                            {service.price}
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                                    {service.type}
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <Link
                                                                        to={`/service/${toUrlFriendly(service.name)}`}
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
                                    ))}
                            </div>
                        </div>

                        {/* Sidebar - Image & Info */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-4">
                                {/* Clinic Image */}
                                <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                                    <div className="text-center p-6">
                                        <div className="text-4xl mb-2">🦷</div>
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
                                        <button className="w-full mt-4 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold">
                                            Đặt lịch ngay
                                        </button>
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
                            <strong>Lưu ý:</strong> Giá dịch vụ có thể thay đổi tùy theo tình trạng răng miệng và phương pháp điều trị cụ thể.
                            Vui lòng liên hệ để được tư vấn chi tiết và chính xác nhất.
                        </p>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default ServicesPricing;
