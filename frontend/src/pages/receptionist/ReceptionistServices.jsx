import React, { useState } from 'react';
import { ClipboardList, Search, DollarSign, Clock } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

// Mock Services Data
const mockServices = [
    {
        id: 'srv_001',
        name: 'Khám tổng quát',
        category: 'Khám bệnh',
        price: 200000,
        duration: 30,
        description: 'Khám sức khỏe tổng quát, tư vấn bác sĩ',
        status: 'active'
    },
    {
        id: 'srv_002',
        name: 'Trám răng amalgam',
        category: 'Điều trị',
        price: 300000,
        duration: 45,
        description: 'Trám răng sâu bằng vật liệu amalgam',
        status: 'active'
    },
    {
        id: 'srv_003',
        name: 'Trám răng composite',
        category: 'Điều trị',
        price: 500000,
        duration: 60,
        description: 'Trám răng thẩm mỹ bằng composite',
        status: 'active'
    },
    {
        id: 'srv_004',
        name: 'Nhổ răng',
        category: 'Phẫu thuật',
        price: 400000,
        duration: 30,
        description: 'Nhổ răng đơn giản',
        status: 'active'
    },
    {
        id: 'srv_005',
        name: 'Lấy cao răng',
        category: 'Vệ sinh',
        price: 250000,
        duration: 30,
        description: 'Lấy cao răng, vệ sinh răng miệng',
        status: 'active'
    },
    {
        id: 'srv_006',
        name: 'Tẩy trắng răng',
        category: 'Thẩm mỹ',
        price: 2000000,
        duration: 90,
        description: 'Tẩy trắng răng công nghệ Laser',
        status: 'active'
    },
    {
        id: 'srv_007',
        name: 'Niềng răng mắc cài kim loại',
        category: 'Chỉnh nha',
        price: 25000000,
        duration: 60,
        description: 'Niềng răng mắc cài kim loại truyền thống',
        status: 'active'
    },
    {
        id: 'srv_008',
        name: 'Cấy ghép Implant',
        category: 'Phẫu thuật',
        price: 15000000,
        duration: 120,
        description: 'Cấy ghép implant Titanium',
        status: 'active'
    }
];

const ReceptionistServices = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    const filteredServices = mockServices.filter(service => {
        const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || service.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = [...new Set(mockServices.map(s => s.category))];

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Danh Sách Dịch Vụ</h1>
                <p className="text-gray-600 mt-1">Thông tin các dịch vụ nha khoa</p>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm dịch vụ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    {/* Category Filter */}
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="all">Tất cả danh mục</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </Card>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.length > 0 ? (
                    filteredServices.map((service) => (
                        <Card key={service.id} className="hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <Badge variant="primary">{service.category}</Badge>
                                <Badge variant="success">Active</Badge>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-2">{service.name}</h3>
                            <p className="text-sm text-gray-600 mb-4">{service.description}</p>

                            <div className="space-y-2 border-t border-gray-200 pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 flex items-center">
                                        <DollarSign size={16} className="mr-1" />
                                        Giá dịch vụ
                                    </span>
                                    <span className="text-lg font-bold text-primary-600">
                                        {service.price.toLocaleString('vi-VN')}đ
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 flex items-center">
                                        <Clock size={16} className="mr-1" />
                                        Thời gian
                                    </span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {service.duration} phút
                                    </span>
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full">
                        <Card>
                            <div className="text-center py-12">
                                <ClipboardList size={48} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500">Không tìm thấy dịch vụ nào</p>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReceptionistServices;
