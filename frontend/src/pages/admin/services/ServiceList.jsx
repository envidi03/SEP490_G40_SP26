import React, { useState, useEffect } from 'react';
import Toast from '../../../components/ui/Toast';
import { Plus, ClipboardList } from 'lucide-react';
import serviceService from '../../../services/serviceService';

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
 * - Xem danh sách dịch vụ (API)
 * - Thêm dịch vụ mới (API)
 * - Cập nhật thông tin dịch vụ (API)
 * - Cập nhật giá dịch vụ (API)
 * - Xóa dịch vụ (API - Soft delete)
 * - Lọc theo danh mục
 * - Tìm kiếm dịch vụ
 * 
 * @component
 */
const ServiceList = () => {
    // ========== STATE MANAGEMENT ==========
    const [services, setServices] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        size: 5,
        totalItems: 0,
        totalPages: 0
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
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
        price: '',
        duration: '',
        icon: '',
        equipment_service: [],
        status: 'AVAILABLE'
    });

    const [priceForm, setPriceForm] = useState({
        price: ''
    });

    // ========== EFFECTS ==========
    useEffect(() => {
        fetchServices(1); // Fetch first page on mount
    }, []);

    // Debounce search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchServices(1); // Reset to page 1 on new search
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // ========== API CALLS ==========
    const fetchServices = async (page = 1) => {
        try {
            setLoading(true);
            const params = {
                page,
                limit: pagination.size,
                search: searchTerm
            };
            const response = await serviceService.getAllServices(params);

            // Backend trả về: { data: [...], pagination: { page, size, totalItems, totalPages } }
            const data = response.data || [];
            const pageData = response.pagination || { page: 1, size: 5, totalItems: 0, totalPages: 0 };

            setServices(data);
            setPagination(pageData);
        } catch (error) {
            console.error('Error fetching services:', error);
            setToast({
                show: true,
                type: 'error',
                message: '❌ Không thể tải danh sách dịch vụ.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        fetchServices(newPage);
    };

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
     * Get category color (Now dummy function since category is removed from backend)
     */
    const getCategoryColor = () => {
        return 'bg-blue-100 text-blue-700 border-blue-200';
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
            price: '',
            duration: '',
            icon: '',
            equipment_service: [],
            status: 'AVAILABLE'
        });
        setShowServiceModal(true);
    };

    /**
     * Handler: Open edit service modal
     */
    const handleEditService = async (service) => {
        setIsEditMode(true);
        setSelectedService(service);

        // Fetch đầy đủ detail để lấy equipment_service (list API exclude trường này)
        let fullService = service;
        try {
            const detail = await serviceService.getServiceById(service._id);
            if (detail?.data) fullService = detail.data;
        } catch (error) {
            console.error('Error fetching service detail for edit:', error);
            // fallback về list item nếu API lỗi
        }

        setServiceForm({
            service_name: fullService.service_name,
            description: fullService.description,
            price: fullService.price,
            duration: fullService.duration,
            icon: fullService.icon || '',
            equipment_service: fullService.equipment_service || [],
            status: fullService.status
        });
        setShowServiceModal(true);
    };

    /**
     * Handler: Save service
     */
    const handleSaveService = async () => {
        // Validation
        if (!serviceForm.service_name.trim()) {
            setToast({
                show: true,
                type: 'error',
                message: '❌ Vui lòng nhập tên dịch vụ!'
            });
            return;
        }

        if (!serviceForm.price || serviceForm.price <= 0) {
            setToast({
                show: true,
                type: 'error',
                message: '❌ Vui lòng nhập giá dịch vụ hợp lệ!'
            });
            return;
        }

        try {
            const serviceData = {
                ...serviceForm,
                price: Number(serviceForm.price),
                duration: Number(serviceForm.duration)
            };

            if (isEditMode) {
                // Update service
                await serviceService.updateService(selectedService._id, serviceData);
            } else {
                // Add new service
                await serviceService.createService(serviceData);
            }

            // Close modal first
            setShowServiceModal(false);
            setSelectedService(null);

            // Show toast notification
            setToast({
                show: true,
                type: 'success',
                message: isEditMode ? '✅ Cập nhật dịch vụ thành công!' : '✅ Thêm dịch vụ mới thành công!'
            });

            // Refresh list
            fetchServices(pagination.page);
        } catch (error) {
            console.error('Error saving service:', error);
            setToast({
                show: true,
                type: 'error',
                message: error.response?.data?.message || '❌ Có lỗi xảy ra khi lưu dịch vụ.'
            });
        }
    };

    /**
     * Handler: Delete service (Deactivate)
     */
    const handleDeleteService = async (serviceId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này? Hành động này sẽ chuyển trạng thái sang "Ngừng hoạt động".')) {
            try {
                // Using updateStatus to simulate delete as per serviceService implementation
                await serviceService.updateServiceStatus(serviceId, 'UNAVAILABLE');
                setToast({
                    show: true,
                    type: 'success',
                    message: '✅ Đã xóa dịch vụ (chuyển sang ngừng hoạt động)!'
                });
                fetchServices(pagination.page); // Refresh list
            } catch (error) {
                console.error('Error deleting service:', error);
                setToast({
                    show: true,
                    type: 'error',
                    message: error.response?.data?.message || '❌ Có lỗi xảy ra khi xóa dịch vụ.'
                });
            }
        }
    };

    /**
     * Handler: Open price update modal
     */
    const handleUpdatePrice = (service) => {
        setSelectedService(service);
        setPriceForm({
            price: service.price
        });
        setShowPriceModal(true);
    };

    /**
     * Handler: Save price
     */
    const handleSavePrice = async () => {
        if (!priceForm.price || priceForm.price <= 0) {
            setToast({
                show: true,
                type: 'error',
                message: '❌ Vui lòng nhập giá hợp lệ!'
            });
            return;
        }

        try {
            await serviceService.updateService(selectedService._id, {
                price: Number(priceForm.price)
            });

            // Close modal first
            setShowPriceModal(false);
            setSelectedService(null);

            // Show toast notification
            setToast({
                show: true,
                type: 'success',
                message: '✅ Cập nhật giá dịch vụ thành công!'
            });

            // Refresh list
            fetchServices(pagination.page);
        } catch (error) {
            console.error('Error updating price:', error);
            setToast({
                show: true,
                type: 'error',
                message: error.response?.data?.message || '❌ Có lỗi xảy ra khi cập nhật giá.'
            });
        }
    };

    // ========== RENDER ==========

    // Calculate statistics
    const activeServices = services.filter(s => s.status === 'AVAILABLE').length;
    const avgPrice = services.length > 0
        ? services.reduce((sum, s) => sum + Number(s.price || 0), 0) / services.length
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

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <>
                        {/* Statistics Component */}
                        <ServiceStatistics
                            totalServices={pagination.totalItems} // Use total items from server
                            activeServices={activeServices} // Note: This is only for current page execution
                            avgPrice={avgPrice}
                            formatCurrency={formatCurrency}
                        />

                        {/* Filters Component */}
                        <ServiceFilters
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            // categoryFilter={categoryFilter} // Removed
                            // setCategoryFilter={setCategoryFilter} // Removed
                            categories={[]} // Empty array as category is removed
                        />

                        {/* Services Grid Component */}
                        <ServiceGrid
                            services={services}
                            pagination={pagination}
                            onPageChange={handlePageChange}
                            searchTerm={searchTerm}
                            onViewDetails={async (service) => {
                                try {
                                    const detail = await serviceService.getServiceById(service._id, { limit: 100 });
                                    setSelectedDetailService(detail?.data || service);
                                } catch {
                                    setSelectedDetailService(service);
                                }
                                setShowDetailModal(true);
                            }}
                            onEdit={handleEditService}
                            onDelete={(id) => handleDeleteService(id)}
                            onUpdatePrice={handleUpdatePrice}
                            formatCurrency={formatCurrency}
                            getCategoryColor={getCategoryColor}
                        />
                    </>
                )}
            </div>

            {/* Service Form Modal */}
            <ServiceFormModal
                show={showServiceModal}
                isEditMode={isEditMode}
                serviceForm={serviceForm}
                setServiceForm={setServiceForm}
                categories={[]} // No categories
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
            <Toast
                show={toast.show}
                type={toast.type}
                message={toast.message}
                onClose={() => setToast({ ...toast, show: false })}
                duration={3000}
            />
        </div>
    );
};

export default ServiceList;
