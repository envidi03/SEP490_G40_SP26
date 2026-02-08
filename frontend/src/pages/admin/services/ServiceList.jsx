import React, { useState, useEffect } from 'react';
import { mockServices } from '../../../utils/mockData';
import Toast from '../../../components/ui/Toast';
import { Plus } from 'lucide-react';
import { ClipboardList } from 'lucide-react';

// Components
import ServiceStatistics from './components/ServiceStatistics';
import ServiceFilters from './components/ServiceFilters';
import ServiceGrid from './components/ServiceGrid';
import ServiceFormModal from './components/ServiceFormModal';
import ServicePriceModal from './components/ServicePriceModal';
import ServiceDetailModal from './components/ServiceDetailModal';

/**
 * ServiceList - Trang quản lý dịch vụ nha khoa
 * 
 * Chức năng:
 * - Xem danh sách dịch vụ
 * - Thêm dịch vụ mới
 * - Cập nhật thông tin dịch vụ
 * - Cập nhật giá dịch vụ
 * - Xóa dịch vụ
 * - Lọc theo danh mục
 * - Tìm kiếm dịch vụ
 * 
 * @component
 */
const ServiceList = () => {
    // ========== STATE MANAGEMENT ==========
    const [services, setServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

    // Modals
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [showPriceModal, setShowPriceModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedDetailService, setSelectedDetailService] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    // Form data
    const [serviceForm, setServiceForm] = useState({
        service_name: '',
        description: '',
        base_price: '',
        category: 'Khám và Tư vấn',
        duration: '',
        status: 'ACTIVE'
    });

    const [priceForm, setPriceForm] = useState({
        base_price: ''
    });

    // Categories
    const categories = [
        'Khám và Tư vấn',
        'Trám răng',
        'Vệ sinh răng miệng',
        'Phẫu thuật',
        'Thẩm mỹ',
        'Chỉnh nha',
        'Phục hồi răng',
        'Nội nha'
    ];

    // ========== EFFECTS ==========
    useEffect(() => {
        setServices(mockServices);
        setFilteredServices(mockServices);
    }, []);

    useEffect(() => {
        let filtered = services;

        // Filter by category
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(s => s.category === categoryFilter);
        }

        // Filter by search term
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(s =>
                s.service_name.toLowerCase().includes(searchLower) ||
                s.description.toLowerCase().includes(searchLower)
            );
        }

        setFilteredServices(filtered);
    }, [searchTerm, categoryFilter, services]);

    // ========== HELPER FUNCTIONS ==========

    /**
     * Format currency
     */
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    /**
     * Get category color
     */
    const getCategoryColor = (category) => {
        const colors = {
            'Khám và Tư vấn': 'bg-blue-100 text-blue-700 border-blue-200',
            'Trám răng': 'bg-green-100 text-green-700 border-green-200',
            'Vệ sinh răng miệng': 'bg-cyan-100 text-cyan-700 border-cyan-200',
            'Phẫu thuật': 'bg-red-100 text-red-700 border-red-200',
            'Thẩm mỹ': 'bg-pink-100 text-pink-700 border-pink-200',
            'Chỉnh nha': 'bg-purple-100 text-purple-700 border-purple-200',
            'Phục hồi răng': 'bg-orange-100 text-orange-700 border-orange-200',
            'Nội nha': 'bg-indigo-100 text-indigo-700 border-indigo-200'
        };
        return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    // ========== HANDLERS ==========

    /**
     * Handler: Open add service modal
     */
    const handleAddService = () => {
        setIsEditMode(false);
        setServiceForm({
            service_name: '',
            description: '',
            base_price: '',
            category: 'Khám và Tư vấn',
            duration: '',
            status: 'ACTIVE'
        });
        setShowServiceModal(true);
    };

    /**
     * Handler: Open edit service modal
     */
    const handleEditService = (service) => {
        setIsEditMode(true);
        setSelectedService(service);
        setServiceForm({
            service_name: service.service_name,
            description: service.description,
            base_price: service.base_price,
            category: service.category,
            duration: service.duration,
            status: service.status
        });
        setShowServiceModal(true);
    };

    /**
     * Handler: Save service
     */
    const handleSaveService = () => {
        // Validation
        if (!serviceForm.service_name.trim()) {
            setToast({
                show: true,
                type: 'error',
                message: '❌ Vui lòng nhập tên dịch vụ!'
            });
            return;
        }

        if (!serviceForm.base_price || serviceForm.base_price <= 0) {
            setToast({
                show: true,
                type: 'error',
                message: '❌ Vui lòng nhập giá dịch vụ hợp lệ!'
            });
            return;
        }

        if (isEditMode) {
            // Update service
            setServices(prev => prev.map(s =>
                s.id === selectedService.id
                    ? { ...s, ...serviceForm, base_price: Number(serviceForm.base_price), duration: Number(serviceForm.duration) }
                    : s
            ));
            setToast({
                show: true,
                type: 'success',
                message: '✅ Cập nhật dịch vụ thành công!'
            });
        } else {
            // Add new service
            const newService = {
                id: `service_${String(services.length + 1).padStart(3, '0')}`,
                ...serviceForm,
                base_price: Number(serviceForm.base_price),
                duration: Number(serviceForm.duration)
            };
            setServices(prev => [...prev, newService]);
            setToast({
                show: true,
                type: 'success',
                message: '✅ Thêm dịch vụ mới thành công!'
            });
        }

        setShowServiceModal(false);
        setSelectedService(null);
    };

    /**
     * Handler: Delete service
     */
    const handleDeleteService = (serviceId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) {
            setServices(prev => prev.filter(s => s.id !== serviceId));
            setToast({
                show: true,
                type: 'success',
                message: '✅ Đã xóa dịch vụ!'
            });
        }
    };

    /**
     * Handler: Open price update modal
     */
    const handleUpdatePrice = (service) => {
        setSelectedService(service);
        setPriceForm({
            base_price: service.base_price
        });
        setShowPriceModal(true);
    };

    /**
     * Handler: Save price
     */
    const handleSavePrice = () => {
        if (!priceForm.base_price || priceForm.base_price <= 0) {
            setToast({
                show: true,
                type: 'error',
                message: '❌ Vui lòng nhập giá hợp lệ!'
            });
            return;
        }

        setServices(prev => prev.map(s =>
            s.id === selectedService.id
                ? { ...s, base_price: Number(priceForm.base_price) }
                : s
        ));

        setShowPriceModal(false);
        setSelectedService(null);
        setToast({
            show: true,
            type: 'success',
            message: '✅ Cập nhật giá dịch vụ thành công!'
        });
    };

    // ========== RENDER ==========

    // Calculate statistics
    const totalServices = services.length;
    const activeServices = services.filter(s => s.status === 'ACTIVE').length;
    const avgPrice = services.length > 0
        ? services.reduce((sum, s) => sum + s.base_price, 0) / services.length
        : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                            <ClipboardList className="text-blue-600" size={40} />
                            Quản lý Dịch vụ
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Danh sách dịch vụ nha khoa - Quản lý giá và thông tin
                        </p>
                    </div>

                    {/* Add Service Button */}
                    <button
                        onClick={handleAddService}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <Plus size={20} />
                        <span>Thêm dịch vụ</span>
                    </button>
                </div>

                {/* Statistics Component */}
                <ServiceStatistics
                    totalServices={totalServices}
                    activeServices={activeServices}
                    avgPrice={avgPrice}
                    formatCurrency={formatCurrency}
                />

                {/* Filters Component */}
                <ServiceFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    categoryFilter={categoryFilter}
                    setCategoryFilter={setCategoryFilter}
                    categories={categories}
                />

                {/* Services Grid Component */}
                <ServiceGrid
                    services={filteredServices}
                    filteredServicesLength={filteredServices.length}
                    totalServicesLength={services.length}
                    searchTerm={searchTerm}
                    categoryFilter={categoryFilter}
                    onViewDetails={(service) => {
                        setSelectedDetailService(service);
                        setShowDetailModal(true);
                    }}
                    onEdit={handleEditService}
                    onDelete={handleDeleteService}
                    onUpdatePrice={handleUpdatePrice}
                    formatCurrency={formatCurrency}
                    getCategoryColor={getCategoryColor}
                />
            </div>

            {/* Service Form Modal */}
            <ServiceFormModal
                show={showServiceModal}
                isEditMode={isEditMode}
                serviceForm={serviceForm}
                setServiceForm={setServiceForm}
                categories={categories}
                onSave={handleSaveService}
                onClose={() => setShowServiceModal(false)}
            />

            {/* Service Detail Modal */}
            <ServiceDetailModal
                show={showDetailModal}
                service={selectedDetailService}
                onClose={() => setShowDetailModal(false)}
                formatCurrency={formatCurrency}
                getCategoryColor={getCategoryColor}
            />

            {/* Price Update Modal */}
            <ServicePriceModal
                show={showPriceModal}
                selectedService={selectedService}
                priceForm={priceForm}
                setPriceForm={setPriceForm}
                formatCurrency={formatCurrency}
                onSave={handleSavePrice}
                onClose={() => setShowPriceModal(false)}
            />

            {/* Toast Notification */}
            {toast.show && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast({ ...toast, show: false })}
                    duration={3000}
                />
            )}
        </div>
    );
};

export default ServiceList;
