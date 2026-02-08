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
import EquipmentDetailModal from './modals/EquipmentDetailModal';
import EquipmentPagination from './components/EquipmentPagination';

/**
 * EquipmentList - Trang quản lý thiết bị nha khoa
 * 
 * Chức năng:
 * - Xem danh sách thiết bị
 * - Thêm thiết bị mới
 * - Cập nhật thông tin thiết bị
 * - Xem lịch sử sử dụng thiết bị
 * - Theo dõi bảo trì
 * 
 * @component
 */
const EquipmentList = () => {
    // ========== STATE MANAGEMENT ==========
    const [equipment, setEquipment] = useState([]);
    const [equipmentUsage, setEquipmentUsage] = useState([]);
    const [filteredEquipment, setFilteredEquipment] = useState([]);
    const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 0, page: 1, size: 10 });
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
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

    // Equipment Form
    const [equipmentForm, setEquipmentForm] = useState({
        equipment_name: '',
        equipment_type: '',
        equipment_serial_number: '',
        purchase_date: '',
        supplier: '',
        warranty: '',
        status: 'READY'
    });

    // ========== DATA FETCHING ==========
    useEffect(() => {
        fetchEquipment();
        setEquipmentUsage(mockEquipmentUsage);
    }, []);

    const fetchEquipment = async (page = 1, size = 10) => {
        try {
            setLoading(true);
            const response = await equipmentService.getEquipments({ page, size });

            // Update equipment data
            setEquipment(response.data);
            setFilteredEquipment(response.data);

            // Update pagination info if available
            if (response.pagination) {
                setPagination(response.pagination);
            }
        } catch (err) {
            console.error('Error fetching equipment:', err);
            setError(err.message);
            setToast({
                show: true,
                type: 'error',
                message: '❌ Lỗi khi tải danh sách thiết bị!'
            });
        } finally {
            setLoading(false);
        }
    };

    // Page change handler
    const handlePageChange = (page) => {
        fetchEquipment(page, pagination.size);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ========== FILTERING ==========
    useEffect(() => {
        let filtered = equipment;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(equip =>
                equip.equipment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (equip.equipment_serial_number || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(equip => equip.status === statusFilter);
        }

        setFilteredEquipment(filtered);
    }, [searchTerm, statusFilter, equipment]);

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
                return {
                    ...u,
                    userName: user?.full_name || 'Unknown'
                };
            });
    };

    // ========== HANDLERS ==========
    const handleAddEquipment = () => {
        setIsEditMode(false);
        setSelectedEquipment(null);
        setEquipmentForm({
            equipment_name: '',
            equipment_type: '',
            equipment_serial_number: '',
            purchase_date: '',
            supplier: '',
            warranty: '',
            status: 'READY'
        });
        setShowEquipmentModal(true);
    };

    const handleEditEquipment = (equip) => {
        setIsEditMode(true);
        setSelectedEquipment(equip);
        setEquipmentForm({
            equipment_name: equip.equipment_name || '',
            equipment_type: equip.equipment_type || '',
            equipment_serial_number: equip.equipment_serial_number || '',
            // Format dates for input[type="date"]
            purchase_date: formatDateForInput(equip.purchase_date),
            supplier: equip.supplier || '',
            warranty: formatDateForInput(equip.warranty),
            status: equip.status || 'READY'
        });
        setShowEquipmentModal(true);
    };

    const handleCreateEquipment = async () => {
        if (!equipmentForm.equipment_name.trim()) {
            setToast({
                show: true,
                type: 'error',
                message: '❌ Vui lòng nhập tên thiết bị!'
            });
            return;
        }

        if (!equipmentForm.equipment_type.trim()) {
            setToast({
                show: true,
                type: 'error',
                message: '❌ Vui lòng nhập loại thiết bị!'
            });
            return;
        }

        try {
            await equipmentService.createEquipment(equipmentForm);
            setToast({
                show: true,
                type: 'success',
                message: '✅ Thêm thiết bị mới thành công!'
            });

            await fetchEquipment();
            setShowEquipmentModal(false);
            setSelectedEquipment(null);
        } catch (err) {
            console.error('Error creating equipment:', err);

            let errorMessage = 'Thêm thiết bị thất bại!';

            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.data?.message) {
                errorMessage = err.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }

            if (err.response?.status === 409 || err.statusCode === 409) {
                errorMessage = 'Số serial đã tồn tại trong hệ thống!';
            }

            setToast({
                show: true,
                type: 'error',
                message: `❌ ${errorMessage}`
            });
        }
    };

    const handleUpdateEquipment = async () => {
        if (!equipmentForm.equipment_name.trim()) {
            setToast({
                show: true,
                type: 'error',
                message: '❌ Vui lòng nhập tên thiết bị!'
            });
            return;
        }

        if (!equipmentForm.equipment_type.trim()) {
            setToast({
                show: true,
                type: 'error',
                message: '❌ Vui lòng nhập loại thiết bị!'
            });
            return;
        }

        try {
            await equipmentService.updateEquipment(selectedEquipment._id || selectedEquipment.id, equipmentForm);
            setToast({
                show: true,
                type: 'success',
                message: '✅ Cập nhật thiết bị thành công!'
            });

            await fetchEquipment();
            setShowEquipmentModal(false);
            setSelectedEquipment(null);
        } catch (err) {
            console.error('Error updating equipment:', err);

            let errorMessage = 'Cập nhật thiết bị thất bại!';

            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.data?.message) {
                errorMessage = err.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }

            if (err.response?.status === 409 || err.statusCode === 409) {
                errorMessage = 'Số serial đã tồn tại trong hệ thống!';
            }

            setToast({
                show: true,
                type: 'error',
                message: `❌ ${errorMessage}`
            });
        }
    };

    const handleSaveEquipment = () => {
        if (isEditMode && selectedEquipment) {
            handleUpdateEquipment();
        } else if (!isEditMode && !selectedEquipment) {
            handleCreateEquipment();
        } else {
            console.error('Invalid state: isEditMode and selectedEquipment mismatch');
            setToast({
                show: true,
                type: 'error',
                message: '❌ Lỗi trạng thái form. Vui lòng thử lại!'
            });
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

    // ========== STATISTICS ==========
    // Use totalItems from pagination for accurate total count
    const totalEquipment = pagination.totalItems || equipment.length;
    const readyEquipment = equipment.filter(e => e.status === 'READY').length;
    const inUseEquipment = equipment.filter(e => e.status === 'IN_USE').length;
    const maintenanceCount = equipment.filter(e => e.status === 'MAINTENANCE').length;
    const repairingCount = equipment.filter(e => e.status === 'REPAIRING').length;
    const faultyCount = equipment.filter(e => e.status === 'FAULTY').length;
    const sterilizingCount = equipment.filter(e => e.status === 'STERILIZING').length;

    // ========== RENDER ==========
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                            <Wrench className="text-blue-600" size={40} />
                            Quản lý Thiết bị
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Danh sách thiết bị nha khoa - Theo dõi bảo trì và sử dụng
                        </p>
                    </div>

                    {/* Add Equipment Button */}
                    <button
                        onClick={handleAddEquipment}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <Plus size={20} />
                        <span>Thêm thiết bị</span>
                    </button>
                </div>

                {/* Statistics */}
                <EquipmentStatistics
                    totalEquipment={totalEquipment}
                    readyEquipment={readyEquipment}
                    inUseEquipment={inUseEquipment}
                    maintenanceCount={maintenanceCount}
                    repairingCount={repairingCount}
                    faultyCount={faultyCount}
                    sterilizingCount={sterilizingCount}
                />

                {/* Filters */}
                <EquipmentFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                />

                {/* Equipment Grid */}
                <EquipmentGrid
                    filteredEquipment={filteredEquipment}
                    loading={loading}
                    equipmentUsage={equipmentUsage}
                    onViewDetails={handleViewDetails}
                    onViewUsage={handleViewUsage}
                    onEdit={handleEditEquipment}
                    getStatusColor={getStatusColor}
                    getStatusText={getStatusText}
                    formatDate={formatDate}
                    searchTerm={searchTerm}
                    statusFilter={statusFilter}
                />

                {/* Pagination */}
                <EquipmentPagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.totalItems}
                    pageSize={pagination.size}
                    onPageChange={handlePageChange}
                />
            </div>

            {/* Modals */}
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
                formatDate={formatDate}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
            />

            {/* Toast Notification */}
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
