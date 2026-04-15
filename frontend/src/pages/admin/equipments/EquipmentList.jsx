import React, { useState, useEffect } from 'react';
import equipmentService from '../../../services/equipmentService';
import { mockEquipmentUsage, mockUsers } from '../../../utils/mockData';
import { formatDate, formatDateForInput } from '../../../utils/dateUtils';
import Toast from '../../../components/ui/Toast';
import { Wrench, Plus } from 'lucide-react';

// Components
import EquipmentStatistics from './components/EquipmentStatistics';
import EquipmentFilters from './components/EquipmentFilters';
import EquipmentGrid from './components/EquipmentGrid';
import EquipmentFormModal from './components/EquipmentFormModal';
import EquipmentUsageModal from './components/EquipmentUsageModal';
import EquipmentDetailModal from './components/EquipmentDetailModal';
import EquipmentPagination from './components/EquipmentPagination';

import AddChildEquipmentModal from './components/AddChildEquipmentModal';

const EquipmentList = () => {
    // ========== STATE MANAGEMENT ==========
    const [equipment, setEquipment] = useState([]);
    const [equipmentUsage, setEquipmentUsage] = useState([]);
    const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 0, page: 1, size: 5 });
    const [statistics, setStatistics] = useState({ total: 0, ready: 0, in_use: 0, maintenance: 0, repairing: 0, faulty: 0, sterilizing: 0 });

    const [searchTerm, setSearchTerm] = useState('');
    const [categoryStatus, setCategoryStatus] = useState('');
    const [itemStatus, setItemStatus] = useState('');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

    // Modals
    const [showEquipmentModal, setShowEquipmentModal] = useState(false);
    const [showUsageModal, setShowUsageModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [selectedDetailEquipment, setSelectedDetailEquipment] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    // State quản lý Modal thêm thiết bị con
    const [showAddChildModal, setShowAddChildModal] = useState(false);
    const [selectedCategoryForChild, setSelectedCategoryForChild] = useState(null);

    // THAY ĐỔI: Cấu trúc Form mặc định (Sửa lại cho khớp với Model mới)
    const [equipmentForm, setEquipmentForm] = useState({
        equipment_type: '',
        status: 'ACTIVE',
        equipment: []
    });

    // ========== DATA FETCHING ==========
    useEffect(() => {
        fetchEquipment(1, pagination.size, '', '', '');
        setEquipmentUsage(mockEquipmentUsage);
    }, []);

    const fetchEquipment = async (page = 1, size = pagination.size, search = searchTerm, catStatus = categoryStatus, iStatus = itemStatus) => {
        try {
            setLoading(true);
            const params = { page: page, limit: size };
            if (search) params.search = search;
            if (catStatus) params.category_status = catStatus;
            if (iStatus) params.status = iStatus;

            const response = await equipmentService.getEquipments(params);
            setEquipment(response.data || []);
            if (response.pagination) setPagination(response.pagination);
            if (response.statistics) setStatistics(response.statistics);
        } catch (err) {
            console.error('Error fetching equipment:', err);
            setError(err.message);
            setToast({ show: true, type: 'error', message: '❌ Lỗi khi tải danh sách thiết bị!' });
        } finally {
            setLoading(false);
        }
    };

    // ========== HANDLERS ==========
    const handleSearch = (filters) => {
        setSearchTerm(filters.searchTerm);
        setCategoryStatus(filters.categoryStatus);
        setItemStatus(filters.itemStatus);
        fetchEquipment(1, pagination.size, filters.searchTerm, filters.categoryStatus, filters.itemStatus);
    };

    const handlePageChange = (page) => {
        fetchEquipment(page, pagination.size, searchTerm, categoryStatus, itemStatus);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ========== HELPER FUNCTIONS ==========
    const getStatusColor = (status) => {
        const colors = {
            'READY': 'border-green-500 text-green-700',
            'IN_USE': 'border-blue-500 text-blue-700',
            'MAINTENANCE': 'border-yellow-500 text-yellow-700',
            'REPAIRING': 'border-orange-500 text-orange-700',
            'FAULTY': 'border-red-500 text-red-700',
            'STERILIZING': 'border-purple-500 text-purple-700'
        };
        return colors[status] || 'border-gray-500 text-gray-700';
    };

    const getStatusText = (status) => {
        const texts = {
            'READY': 'Sẵn sàng',
            'IN_USE': 'Đang sử dụng',
            'MAINTENANCE': 'Bảo trì',
            'REPAIRING': 'Đang sửa chữa',
            'FAULTY': 'Bị hỏng',
            'STERILIZING': 'Đang khử trùng'
        };
        return texts[status] || status;
    };

    const getUsageHistory = (equipmentId) => {
        return equipmentUsage
            .filter(u => u.equipment_id === equipmentId)
            .map(u => {
                const user = mockUsers.find(user => user.id === u.user_id);
                return { ...u, userName: user?.full_name || 'Unknown' };
            });
    };

    // ========== CRUD HANDLERS ==========

    // THAY ĐỔI: Khởi tạo form trống với 1 máy rỗng bên trong mảng equipment
    const handleAddEquipment = () => {
        setIsEditMode(false);
        setSelectedEquipment(null);
        setEquipmentForm({
            equipment_type: '',
            status: 'ACTIVE',
            equipment: [{
                equipment_name: '',
                equipment_serial_number: '',
                purchase_date: '',
                supplier: '',
                warranty: '',
                status: 'READY'
            }]
        });
        setShowEquipmentModal(true);
    };

    // THAY ĐỔI: Map dữ liệu Danh mục và mảng máy con vào Form để Sửa
    const handleEditEquipment = (category) => {
        setIsEditMode(true);
        setSelectedEquipment(category); // category là toàn bộ object lấy từ Grid

        // Format lại ngày tháng cho các thiết bị con
        const formattedEquipment = (category.equipment || []).map(item => ({
            ...item,
            purchase_date: item.purchase_date ? item.purchase_date.split('T')[0] : '',
            warranty: item.warranty ? item.warranty.split('T')[0] : ''
        }));

        setEquipmentForm({
            equipment_type: category.equipment_type || '',
            status: category.status || 'ACTIVE',
            equipment: formattedEquipment
        });
        setShowEquipmentModal(true);
    };

    const handleCreateEquipment = async () => {
        if (!equipmentForm.equipment_type?.trim()) {
            setToast({ show: true, type: 'error', message: '❌ Vui lòng nhập loại thiết bị!' });
            return;
        }

        try {
            await equipmentService.createEquipment(equipmentForm);
            setToast({ show: true, type: 'success', message: '✅ Thêm thiết bị mới thành công!' });
            await fetchEquipment(pagination.page, pagination.size, searchTerm, categoryStatus, itemStatus);
            setShowEquipmentModal(false);
            setSelectedEquipment(null);
        } catch (err) {
            console.error('Error creating equipment:', err);
            let errorMessage = 'Thêm thiết bị thất bại!';
            if (err.response?.data?.message) errorMessage = err.response.data.message;
            else if (err.data?.message) errorMessage = err.data.message;
            else if (err.message) errorMessage = err.message;
            if (err.response?.status === 409 || err.statusCode === 409) {
                errorMessage = 'Số serial đã tồn tại trong hệ thống!';
            }
            setToast({ show: true, type: 'error', message: `❌ ${errorMessage}` });
        }
    };

    const handleUpdateEquipment = async () => {
        if (!equipmentForm.equipment_type?.trim()) {
            setToast({ show: true, type: 'error', message: '❌ Vui lòng nhập loại thiết bị!' });
            return;
        }

        try {
            await equipmentService.updateEquipment(selectedEquipment._id || selectedEquipment.id, equipmentForm);
            setToast({ show: true, type: 'success', message: '✅ Cập nhật thiết bị thành công!' });
            await fetchEquipment(pagination.page, pagination.size, searchTerm, categoryStatus, itemStatus);
            setShowEquipmentModal(false);
            setSelectedEquipment(null);
        } catch (err) {
            console.error('Error updating equipment:', err);
            let errorMessage = 'Cập nhật thiết bị thất bại!';
            if (err.response?.data?.message) errorMessage = err.response.data.message;
            else if (err.data?.message) errorMessage = err.data.message;
            else if (err.message) errorMessage = err.message;
            if (err.response?.status === 409 || err.statusCode === 409) {
                errorMessage = 'Số serial đã tồn tại trong hệ thống!';
            }
            setToast({ show: true, type: 'error', message: `❌ ${errorMessage}` });
        }
    };

    const handleSaveEquipment = () => {
        if (isEditMode && selectedEquipment) {
            handleUpdateEquipment();
        } else if (!isEditMode && !selectedEquipment) {
            handleCreateEquipment();
        } else {
            setToast({ show: true, type: 'error', message: '❌ Lỗi trạng thái form. Vui lòng thử lại!' });
        }
    };

    const handleViewDetails = (equip) => {
        setSelectedDetailEquipment(equip);
        setShowDetailModal(true);
    };

    const handleViewUsage = (equip) => {
        setSelectedEquipment(equip);
        setShowUsageModal(true);
    };

    // ========== HANDLERS CHO MODAL THÊM THIẾT BỊ CON ==========
    const handleOpenAddChildModal = (category) => {
        setSelectedCategoryForChild(category);
        setShowAddChildModal(true);
    };

    const handleSaveChildEquipments = async (categoryId, newEquipments) => {
        try {
            await equipmentService.createEquipmentItem(categoryId, { equipment: newEquipments });
            setToast({
                show: true,
                type: 'success',
                message: `✅ Đã thêm ${newEquipments.length} máy mới vào danh mục thành công!`
            });
            setShowAddChildModal(false);
            setSelectedCategoryForChild(null);
            await fetchEquipment(pagination.page, pagination.size, searchTerm, categoryStatus, itemStatus);
        } catch (err) {
            console.error('Error adding child equipments:', err);
            let errorMessage = 'Thêm máy con thất bại!';
            if (err.response?.data?.message) errorMessage = err.response.data.message;
            else if (err.data?.message) errorMessage = err.data.message;
            else if (err.message) errorMessage = err.message;
            setToast({ show: true, type: 'error', message: `❌ ${errorMessage}` });
        }
    };

    // ========== RENDER ==========
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                            <Wrench className="text-blue-600" size={40} />
                            Quản lý Thiết bị
                        </h1>
                        <p className="text-gray-600 text-lg">Danh sách thiết bị nha khoa - Theo dõi bảo trì và sử dụng</p>
                    </div>
                    <button
                        onClick={handleAddEquipment}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <Plus size={20} />
                        <span>Thêm danh mục thiết bị</span>
                    </button>
                </div>

                <EquipmentStatistics statistics={statistics} />
                <EquipmentFilters onSearch={handleSearch} />

                <EquipmentGrid
                    filteredEquipment={equipment}
                    loading={loading}
                    equipmentUsage={equipmentUsage}
                    onViewDetails={handleViewDetails}
                    onViewUsage={handleViewUsage}
                    // Truyền thẳng handleEditEquipment vào Grid
                    onEditCategory={handleEditEquipment}
                    getStatusColor={getStatusColor}
                    getStatusText={getStatusText}
                    formatDate={formatDate}
                    searchTerm={searchTerm}
                    onOpenAddChildModal={handleOpenAddChildModal}
                />

                <EquipmentPagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.totalItems}
                    pageSize={pagination.size}
                    onPageChange={handlePageChange}
                />
            </div>

            <EquipmentFormModal
                show={showEquipmentModal}
                isEditMode={isEditMode}
                equipmentForm={equipmentForm}
                setEquipmentForm={setEquipmentForm}
                onSave={handleSaveEquipment}
                onClose={() => setShowEquipmentModal(false)}
            />

            <EquipmentUsageModal
                show={showUsageModal}
                equipment={selectedEquipment}
                usageHistory={selectedEquipment ? getUsageHistory(selectedEquipment.id || selectedEquipment._id) : []}
                onClose={() => setShowUsageModal(false)}
                formatDate={formatDate}
            />

            <EquipmentDetailModal
                show={showDetailModal}
                equipment={selectedDetailEquipment}
                onClose={() => setShowDetailModal(false)}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
            />

            <AddChildEquipmentModal
                show={showAddChildModal}
                category={selectedCategoryForChild}
                onSave={handleSaveChildEquipments}
                onClose={() => {
                    setShowAddChildModal(false);
                    setSelectedCategoryForChild(null);
                }}
            />

            <Toast
                show={toast.show}
                type={toast.type}
                message={toast.message}
                onClose={() => setToast({ ...toast, show: false })}
            />
        </div>
    );
};

export default EquipmentList;