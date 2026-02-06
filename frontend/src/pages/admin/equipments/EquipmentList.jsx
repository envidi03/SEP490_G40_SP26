import React, { useState, useEffect } from 'react';
import equipmentService from '../../../services/equipmentService';
import { mockEquipmentUsage, mockUsers } from '../../../utils/mockData';
import { formatDate } from '../../../utils/dateUtils';
import Toast from '../../../components/ui/Toast';
import {
    Wrench,
    Plus,
    Search,
    Edit2,
    Trash2,
    Calendar,
    CheckCircle,
    AlertCircle,
    Clock,
    History,
    PackageCheck,
    AlertTriangle,
    Activity,
    Eye
} from 'lucide-react';

import EquipmentDetailModal from './modals/EquipmentDetailModal';

/**
 * EquipmentList - Trang quản lý thiết bị nha khoa
 * 
 * Chức năng:
 * - Xem danh sách thiết bị
 * - Thêm thiết bị mới
 * - Cập nhật thông tin thiết bị
 * - Xóa thiết bị
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

    // Form data
    const [equipmentForm, setEquipmentForm] = useState({
        equipment_name: '',
        equipment_type: '',
        serial_number: '',
        purchase_date: '',
        warranty_expiry: '',
        status: 'READY',
        last_maintenance_date: '',
        next_maintenance_date: ''
    });

    // ========== EFFECTS ==========
    useEffect(() => {
        fetchEquipment();
        // Still using mock data for usage history until backend API is ready
        setEquipmentUsage(mockEquipmentUsage);
    }, []);

    /**
     * Fetch equipment from API
     */
    const fetchEquipment = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await equipmentService.getEquipments();
            const equipmentData = response.data || response;
            setEquipment(equipmentData);
            setFilteredEquipment(equipmentData);
        } catch (err) {
            console.error('Error fetching equipment:', err);
            setError(err.message || 'Không thể tải danh sách thiết bị');
            setToast({
                show: true,
                type: 'error',
                message: '❌ Không thể tải danh sách thiết bị. Vui lòng thử lại!'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let filtered = equipment;

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(e => e.status === statusFilter);
        }

        // Filter by search term
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(e =>
                e.equipment_name.toLowerCase().includes(searchLower) ||
                e.equipment_type.toLowerCase().includes(searchLower) ||
                e.serial_number.toLowerCase().includes(searchLower)
            );
        }

        setFilteredEquipment(filtered);
    }, [searchTerm, statusFilter, equipment]);

    // ========== HELPER FUNCTIONS ==========

    /**
     * Get status color
     */
    const getStatusColor = (status) => {
        const colors = {
            'READY': 'bg-green-100 text-green-700 border-green-200',
            'IN_USE': 'bg-blue-100 text-blue-700 border-blue-200',
            'MAINTENANCE': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'REPAIRING': 'bg-orange-100 text-orange-700 border-orange-200',
            'FAULTY': 'bg-red-100 text-red-700 border-red-200',
            'STERILIZING': 'bg-purple-100 text-purple-700 border-purple-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    /**
     * Get status text
     */
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

    /**
     * Check if maintenance is due soon
     */
    const isMaintenanceDue = (nextDate) => {
        if (!nextDate) return false;
        const today = new Date();
        const next = new Date(nextDate);
        const diffDays = Math.ceil((next - today) / (1000 * 60 * 60 * 24));
        return diffDays <= 30 && diffDays >= 0;
    };

    /**
     * Get equipment usage history
     */
    const getUsageHistory = (equipmentId) => {
        const usage = equipmentUsage.filter(u => u.equipment_id === equipmentId);
        return usage.map(u => {
            const user = mockUsers.find(user => user.id === u.used_by_user_id);
            return {
                ...u,
                userName: user?.full_name || 'Unknown'
            };
        });
    };

    // ========== HANDLERS ==========

    /**
     * Handler: Open add equipment modal
     */
    const handleAddEquipment = () => {
        setIsEditMode(false);
        setEquipmentForm({
            equipment_name: '',
            equipment_type: '',
            serial_number: '',
            purchase_date: '',
            warranty_expiry: '',
            status: 'READY',
            last_maintenance_date: '',
            next_maintenance_date: ''
        });
        setShowEquipmentModal(true);
    };

    /**
     * Handler: Open edit equipment modal
     */
    const handleEditEquipment = (equip) => {
        setIsEditMode(true);
        setSelectedEquipment(equip);
        setEquipmentForm(equip);
        setShowEquipmentModal(true);
    };

    /**
     * Handler: Save equipment
     */
    const handleSaveEquipment = async () => {
        if (!equipmentForm.equipment_name.trim()) {
            setToast({
                show: true,
                type: 'error',
                message: '❌ Vui lòng nhập tên thiết bị!'
            });
            return;
        }

        try {
            if (isEditMode) {
                // Update equipment
                await equipmentService.updateEquipment(selectedEquipment._id || selectedEquipment.id, equipmentForm);
                setToast({
                    show: true,
                    type: 'success',
                    message: '✅ Cập nhật thiết bị thành công!'
                });
            } else {
                // Create new equipment
                await equipmentService.createEquipment(equipmentForm);
                setToast({
                    show: true,
                    type: 'success',
                    message: '✅ Thêm thiết bị mới thành công!'
                });
            }

            // Refresh equipment list
            await fetchEquipment();
            setShowEquipmentModal(false);
            setSelectedEquipment(null);
        } catch (err) {
            console.error('Error saving equipment:', err);
            setToast({
                show: true,
                type: 'error',
                message: `❌ ${isEditMode ? 'Cập nhật' : 'Thêm'} thiết bị thất bại!`
            });
        }
    };

    /**
     * Handler: Delete equipment
     */
    const handleDeleteEquipment = async (equipId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa thiết bị này?')) {
            try {
                // Note: Backend doesn't have delete endpoint yet, using local state for now
                setEquipment(prev => prev.filter(e => e._id !== equipId && e.id !== equipId));
                setToast({
                    show: true,
                    type: 'success',
                    message: '✅ Đã xóa thiết bị!'
                });
            } catch (err) {
                console.error('Error deleting equipment:', err);
                setToast({
                    show: true,
                    type: 'error',
                    message: '❌ Xóa thiết bị thất bại!'
                });
            }
        }
    };

    /**
     * Handler: View usage history
     */
    const handleViewUsage = (equip) => {
        setSelectedEquipment(equip);
        setShowUsageModal(true);
    };

    // ========== RENDER ==========

    // Calculate statistics
    const totalEquipment = equipment.length;
    const readyEquipment = equipment.filter(e => e.status === 'READY').length;
    const maintenanceCount = equipment.filter(e => e.status === 'MAINTENANCE').length;
    const dueSoon = equipment.filter(e => isMaintenanceDue(e.next_maintenance_date)).length;

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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                <Wrench className="text-white" size={28} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Tổng thiết bị</p>
                                <p className="text-3xl font-bold text-blue-600">{totalEquipment}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center shadow-lg">
                                <CheckCircle className="text-white" size={28} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Sẵn sàng</p>
                                <p className="text-3xl font-bold text-green-600">{readyEquipment}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg">
                                <AlertCircle className="text-white" size={28} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Đang bảo trì</p>
                                <p className="text-3xl font-bold text-yellow-600">{maintenanceCount}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg">
                                <AlertTriangle className="text-white" size={28} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Sắp bảo trì</p>
                                <p className="text-3xl font-bold text-red-600">{dueSoon}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                        {/* Search */}
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Tìm kiếm thiết bị..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                onClick={() => setStatusFilter('all')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${statusFilter === 'all'
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                Tất cả
                            </button>
                            <button
                                onClick={() => setStatusFilter('READY')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${statusFilter === 'READY'
                                    ? 'bg-green-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                Sẵn sàng
                            </button>
                            <button
                                onClick={() => setStatusFilter('IN_USE')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${statusFilter === 'IN_USE'
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                Đang dùng
                            </button>
                            <button
                                onClick={() => setStatusFilter('MAINTENANCE')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${statusFilter === 'MAINTENANCE'
                                    ? 'bg-yellow-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                Bảo trì
                            </button>
                            <button
                                onClick={() => setStatusFilter('FAULTY')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${statusFilter === 'FAULTY'
                                    ? 'bg-red-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                Bị hỏng
                            </button>
                        </div>
                    </div>
                </div>

                {/* Equipment Grid */}
                {loading ? (
                    <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            Đang tải...
                        </h3>
                        <p className="text-gray-600">
                            Đang tải danh sách thiết bị
                        </p>
                    </div>
                ) : filteredEquipment.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
                        <Wrench className="text-gray-300 mx-auto mb-4" size={64} />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            Không tìm thấy thiết bị
                        </h3>
                        <p className="text-gray-600">
                            {searchTerm || statusFilter !== 'all'
                                ? 'Không có thiết bị nào phù hợp với bộ lọc của bạn'
                                : 'Chưa có thiết bị nào trong hệ thống'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEquipment.map(equip => {
                            const maintenanceDue = isMaintenanceDue(equip.next_maintenance_date);
                            const equipId = equip._id || equip.id;
                            const usageCount = equipmentUsage.filter(u => u.equipment_id === equipId).length;

                            return (
                                <div
                                    key={equipId}
                                    className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group"
                                >
                                    {/* Header */}
                                    <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <p className="text-xs text-blue-100 mb-1">{equip.equipment_type}</p>
                                                <h3 className="text-xl font-bold mb-2">
                                                    {equip.equipment_name}
                                                </h3>
                                            </div>
                                            {maintenanceDue && (
                                                <AlertTriangle size={24} className="text-yellow-300" />
                                            )}
                                        </div>
                                        <span className={`inline - block px - 3 py - 1 rounded - full text - xs font - semibold border ${getStatusColor(equip.status)} bg - white`}>
                                            {getStatusText(equip.status)}
                                        </span>
                                    </div>

                                    {/* Body */}
                                    <div className="p-6 space-y-3">
                                        {/* Serial Number */}
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Số serial</p>
                                            <p className="text-sm font-mono font-semibold text-gray-900">
                                                {equip.serial_number}
                                            </p>
                                        </div>

                                        {/* Maintenance Info */}
                                        {equip.next_maintenance_date && (
                                            <div className={`p - 3 rounded - lg ${maintenanceDue ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'} `}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Calendar size={14} className={maintenanceDue ? 'text-yellow-600' : 'text-gray-600'} />
                                                    <p className="text-xs font-semibold text-gray-700">
                                                        {maintenanceDue ? 'Sắp bảo trì' : 'Bảo trì tiếp theo'}
                                                    </p>
                                                </div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {formatDate(equip.next_maintenance_date)}
                                                </p>
                                            </div>
                                        )}

                                        {/* Usage Count */}
                                        <div className="flex items-center gap-2">
                                            <Activity size={16} className="text-purple-600" />
                                            <span className="text-sm text-gray-600">
                                                Đã sử dụng: <span className="font-bold text-purple-600">{usageCount}</span> lần
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-4 border-t border-gray-200">
                                            <button
                                                onClick={() => {
                                                    setSelectedDetailEquipment(equip);
                                                    setShowDetailModal(true);
                                                }}
                                                className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 font-medium rounded-xl hover:bg-blue-100 transition-all duration-200"
                                            >
                                                <Eye size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleViewUsage(equip)}
                                                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 font-medium text-sm rounded-xl hover:bg-purple-100 transition-all duration-200"
                                            >
                                                <History size={14} />
                                                <span>Lịch sử</span>
                                            </button>
                                            <button
                                                onClick={() => handleEditEquipment(equip)}
                                                className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-600 font-medium rounded-xl hover:bg-green-100 transition-all duration-200"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteEquipment(equipId)}
                                                className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-all duration-200"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Results Count */}
                {filteredEquipment.length > 0 && (
                    <div className="mt-8 text-center">
                        <p className="text-gray-600">
                            Hiển thị <span className="font-bold text-blue-600">{filteredEquipment.length}</span> / {equipment.length} thiết bị
                        </p>
                    </div>
                )}
            </div>

            {/* Equipment Modal */}
            {showEquipmentModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm" onClick={() => setShowEquipmentModal(false)} />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-t-2xl p-6 z-10">
                                <h2 className="text-2xl font-bold">
                                    {isEditMode ? 'Chỉnh sửa thiết bị' : 'Thêm thiết bị mới'}
                                </h2>
                                <p className="text-blue-100 mt-1">
                                    {isEditMode ? 'Cập nhật thông tin thiết bị' : 'Điền thông tin để tạo thiết bị mới'}
                                </p>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Tên thiết bị <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={equipmentForm.equipment_name}
                                        onChange={(e) => setEquipmentForm({ ...equipmentForm, equipment_name: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Máy X-quang kỹ thuật số"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Loại thiết bị
                                        </label>
                                        <input
                                            type="text"
                                            value={equipmentForm.equipment_type}
                                            onChange={(e) => setEquipmentForm({ ...equipmentForm, equipment_type: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            placeholder="X-ray"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Số serial
                                        </label>
                                        <input
                                            type="text"
                                            value={equipmentForm.serial_number}
                                            onChange={(e) => setEquipmentForm({ ...equipmentForm, serial_number: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            placeholder="XR-2024-001"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Ngày mua
                                        </label>
                                        <input
                                            type="date"
                                            value={equipmentForm.purchase_date}
                                            onChange={(e) => setEquipmentForm({ ...equipmentForm, purchase_date: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Hết hạn bảo hành
                                        </label>
                                        <input
                                            type="date"
                                            value={equipmentForm.warranty_expiry}
                                            onChange={(e) => setEquipmentForm({ ...equipmentForm, warranty_expiry: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Bảo trì lần cuối
                                        </label>
                                        <input
                                            type="date"
                                            value={equipmentForm.last_maintenance_date}
                                            onChange={(e) => setEquipmentForm({ ...equipmentForm, last_maintenance_date: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Bảo trì tiếp theo
                                        </label>
                                        <input
                                            type="date"
                                            value={equipmentForm.next_maintenance_date}
                                            onChange={(e) => setEquipmentForm({ ...equipmentForm, next_maintenance_date: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Trạng thái <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={equipmentForm.status}
                                        onChange={(e) => setEquipmentForm({ ...equipmentForm, status: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                                    >
                                        <option value="READY">Sẵn sàng</option>
                                        <option value="IN_USE">Đang sử dụng</option>
                                        <option value="MAINTENANCE">Bảo trì</option>
                                        <option value="REPAIRING">Đang sửa chữa</option>
                                        <option value="FAULTY">Bị hỏng</option>
                                        <option value="STERILIZING">Đang khử trùng</option>
                                    </select>
                                </div>
                            </div>

                            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl flex gap-3 justify-end">
                                <button
                                    onClick={() => setShowEquipmentModal(false)}
                                    className="px-6 py-2.5 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleSaveEquipment}
                                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                                >
                                    {isEditMode ? 'Cập nhật' : 'Thêm thiết bị'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Usage History Modal */}
            {showUsageModal && selectedEquipment && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm" onClick={() => setShowUsageModal(false)} />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all">
                            <div className="relative bg-gradient-to-br from-purple-600 to-pink-700 text-white rounded-t-2xl p-6">
                                <h2 className="text-2xl font-bold">Lịch sử sử dụng</h2>
                                <p className="text-purple-100 mt-1">{selectedEquipment.equipment_name}</p>
                            </div>

                            <div className="p-6 max-h-96 overflow-y-auto">
                                {getUsageHistory(selectedEquipment.id).length === 0 ? (
                                    <div className="text-center py-8">
                                        <History size={48} className="text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-600">Chưa có lịch sử sử dụng</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {getUsageHistory(selectedEquipment.id).map(usage => (
                                            <div key={usage.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{usage.userName}</p>
                                                        <p className="text-sm text-gray-600">{usage.purpose}</p>
                                                    </div>
                                                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                                        {usage.duration} phút
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <Calendar size={12} />
                                                    {formatDate(usage.used_date)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end">
                                <button
                                    onClick={() => setShowUsageModal(false)}
                                    className="px-6 py-2.5 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Equipment Detail Modal */}
            <EquipmentDetailModal
                show={showDetailModal}
                equipment={selectedDetailEquipment}
                onClose={() => setShowDetailModal(false)}
                formatDate={formatDate}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
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

export default EquipmentList;
