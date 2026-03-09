import React, { useState, useEffect } from 'react';
import { ClipboardList, Search, DollarSign, Clock, Loader2, RefreshCw } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Toast from '../../components/ui/Toast';
import serviceService from '../../services/serviceService';

const ReceptionistServices = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const fetchServices = async () => {
        setLoading(true);
        try {
            const response = await serviceService.getAllServices();
            const data = response.data?.data || response.data || [];
            setServices(Array.isArray(data) ? data : data.data || []);
        } catch (error) {
            console.error('Error fetching services:', error);
            setToast({ show: true, message: 'Lỗi khi tải danh sách dịch vụ', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const filteredServices = services.filter(service => {
        const sName = service.name || '';
        const sDesc = service.description || '';
        const matchesSearch = sName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sDesc.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || service.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = [...new Set(services.map(s => s.category).filter(Boolean))];

    return (
        <div>
            {/* Header */}
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Danh Sách Dịch Vụ</h1>
                    <p className="text-gray-600 mt-1">Thông tin các dịch vụ nha khoa</p>
                </div>
                <button
                    onClick={fetchServices}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
                    title="Tải lại"
                >
                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
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
                {loading ? (
                    <div className="col-span-full text-center py-12">
                        <Loader2 size={40} className="mx-auto text-primary-500 animate-spin mb-4" />
                        <p className="text-gray-500">Đang tải danh sách dịch vụ...</p>
                    </div>
                ) : filteredServices.length > 0 ? (
                    filteredServices.map((service) => (
                        <Card key={service._id} className="hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <Badge variant="primary">{service.category || 'Dịch vụ'}</Badge>
                                <Badge variant={service.status === 'ACTIVE' ? 'success' : 'danger'}>
                                    {service.status === 'ACTIVE' ? 'Hoạt động' : 'Ngưng'}
                                </Badge>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-2">{service.name}</h3>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{service.description || 'Không có mô tả'}</p>

                            <div className="space-y-2 border-t border-gray-200 pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 flex items-center">
                                        <DollarSign size={16} className="mr-1" />
                                        Giá dịch vụ
                                    </span>
                                    <span className="text-lg font-bold text-primary-600">
                                        {(service.price || 0).toLocaleString('vi-VN')}đ
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 flex items-center">
                                        <Clock size={16} className="mr-1" />
                                        Thời gian
                                    </span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {service.duration || 30} phút
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

            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ ...toast, show: false })}
            />
        </div>
    );
};

export default ReceptionistServices;
