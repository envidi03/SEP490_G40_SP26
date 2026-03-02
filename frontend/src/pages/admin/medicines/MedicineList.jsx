import React, { useState, useEffect } from 'react';
import { mockMedicines } from '../../../utils/mockData';
import { formatDate } from '../../../utils/dateUtils';
import Toast from '../../../components/ui/Toast';
import {
    Pill,
    Plus,
    Search,
    Edit2,
    Trash2,
    Calendar,
    AlertTriangle,
    CheckCircle,
    Clock,
    Package,
    DollarSign,
    TrendingDown
} from 'lucide-react';

/**
 * MedicineList - Trang quản lý thuốc và vật tư y tế
 * 
 * Chức năng (theo use case):
 * - Theo dõi lịch khóa của thuốc (CRITICAL)
 * - Xem danh sách thuốc
 * - Thêm/cập nhật/xóa thuốc
 * - Cảnh báo thuốc sắp hết hạn
 * - Theo dõi số lượng tồn kho
 * 
 * @component
 */
const MedicineList = () => {
    // ========== STATE MANAGEMENT ==========
    const [medicines, setMedicines] = useState([]);
    const [filteredMedicines, setFilteredMedicines] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

    // Modals
    const [showMedicineModal, setShowMedicineModal] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    // Form data
    const [medicineForm, setMedicineForm] = useState({
        medicine_name: '',
        medicine_type: '',
        dosage: '',
        manufacturer: '',
        quantity: '',
        unit: 'Viên',
        expiry_date: '',
        batch_number: '',
        price: '',
        status: 'AVAILABLE'
    });

    // ========== EFFECTS ==========
    useEffect(() => {
        setMedicines(mockMedicines);
        setFilteredMedicines(mockMedicines);
    }, []);

    useEffect(() => {
        let filtered = medicines;

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(m => m.status === statusFilter);
        }

        // Filter by search term
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(m =>
                m.medicine_name.toLowerCase().includes(searchLower) ||
                m.medicine_type.toLowerCase().includes(searchLower) ||
                m.manufacturer.toLowerCase().includes(searchLower)
            );
        }

        setFilteredMedicines(filtered);
    }, [searchTerm, statusFilter, medicines]);

    // ========== HELPER FUNCTIONS ==========

    /**
     * Check if medicine is expiring soon (within 60 days)
     */
    const isExpiringSoon = (expiryDate) => {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        return diffDays <= 60 && diffDays >= 0;
    };

    /**
     * Check if medicine is expired
     */
    const isExpired = (expiryDate) => {
        const today = new Date();
        const expiry = new Date(expiryDate);
        return expiry < today;
    };

    /**
     * Get days until expiry
     */
    const getDaysUntilExpiry = (expiryDate) => {
        const today = new Date();
        const expiry = new Date(expiryDate);
        return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    };

    /**
     * Get status color
     */
    const getStatusColor = (status) => {
        const colors = {
            'AVAILABLE': 'bg-green-100 text-green-700 border-green-200',
            'EXPIRING_SOON': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'LOW_STOCK': 'bg-orange-100 text-orange-700 border-orange-200',
            'OUT_OF_STOCK': 'bg-red-100 text-red-700 border-red-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    /**
     * Get status text
     */
    const getStatusText = (status) => {
        const texts = {
            'AVAILABLE': 'Còn hàng',
            'EXPIRING_SOON': 'Sắp hết hạn',
            'LOW_STOCK': 'Sắp hết',
            'OUT_OF_STOCK': 'Hết hàng'
        };
        return texts[status] || status;
    };

    /**
     * Format currency
     */
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    // ========== HANDLERS ==========

    /**
     * Handler: Open add medicine modal
     */
    const handleAddMedicine = () => {
        setIsEditMode(false);
        setMedicineForm({
            medicine_name: '',
            medicine_type: '',
            dosage: '',
            manufacturer: '',
            quantity: '',
            unit: 'Viên',
            expiry_date: '',
            batch_number: '',
            price: '',
            status: 'AVAILABLE'
        });
        setShowMedicineModal(true);
    };

    /**
     * Handler: Open edit medicine modal
     */
    const handleEditMedicine = (medicine) => {
        setIsEditMode(true);
        setSelectedMedicine(medicine);
        setMedicineForm(medicine);
        setShowMedicineModal(true);
    };

    /**
     * Handler: Save medicine
     */
    const handleSaveMedicine = () => {
        if (!medicineForm.medicine_name.trim()) {
            setToast({
                show: true,
                type: 'error',
                message: '❌ Vui lòng nhập tên thuốc!'
            });
            return;
        }

        if (isEditMode) {
            setMedicines(prev => prev.map(m =>
                m.id === selectedMedicine.id
                    ? { ...m, ...medicineForm, quantity: Number(medicineForm.quantity), price: Number(medicineForm.price) }
                    : m
            ));
            setToast({
                show: true,
                type: 'success',
                message: '✅ Cập nhật thuốc thành công!'
            });
        } else {
            const newMedicine = {
                id: `med_${String(medicines.length + 1).padStart(3, '0')}`,
                ...medicineForm,
                quantity: Number(medicineForm.quantity),
                price: Number(medicineForm.price)
            };
            setMedicines(prev => [...prev, newMedicine]);
            setToast({
                show: true,
                type: 'success',
                message: '✅ Thêm thuốc mới thành công!'
            });
        }

        setShowMedicineModal(false);
        setSelectedMedicine(null);
    };

    /**
     * Handler: Delete medicine
     */
    const handleDeleteMedicine = (medId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa thuốc này?')) {
            setMedicines(prev => prev.filter(m => m.id !== medId));
            setToast({
                show: true,
                type: 'success',
                message: '✅ Đã xóa thuốc!'
            });
        }
    };

    // ========== RENDER ==========

    // Calculate statistics
    const totalMedicines = medicines.length;
    const expiringSoon = medicines.filter(m => isExpiringSoon(m.expiry_date)).length;
    const lowStock = medicines.filter(m => m.quantity < 50).length;
    const totalValue = medicines.reduce((sum, m) => sum + (m.quantity * m.price), 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                            <Pill className="text-blue-600" size={40} />
                            Quản lý Thuốc
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Theo dõi lịch khóa và tồn kho thuốc
                        </p>
                    </div>

                    {/* Add Medicine Button */}
                    <button
                        onClick={handleAddMedicine}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <Plus size={20} />
                        <span>Thêm thuốc</span>
                    </button>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                <Pill className="text-white" size={28} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Tổng loại thuốc</p>
                                <p className="text-3xl font-bold text-blue-600">{totalMedicines}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg">
                                <AlertTriangle className="text-white" size={28} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Sắp hết hạn</p>
                                <p className="text-3xl font-bold text-yellow-600">{expiringSoon}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                                <TrendingDown className="text-white" size={28} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Sắp hết hàng</p>
                                <p className="text-3xl font-bold text-orange-600">{lowStock}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center shadow-lg">
                                <DollarSign className="text-white" size={28} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Tổng giá trị</p>
                                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalValue)}</p>
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
                                placeholder="Tìm kiếm thuốc..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center gap-2">
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
                                onClick={() => setStatusFilter('EXPIRING_SOON')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${statusFilter === 'EXPIRING_SOON'
                                    ? 'bg-yellow-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                Sắp hết hạn
                            </button>
                            <button
                                onClick={() => setStatusFilter('LOW_STOCK')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${statusFilter === 'LOW_STOCK'
                                    ? 'bg-orange-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                Sắp hết hàng
                            </button>
                        </div>
                    </div>
                </div>

                {/* Medicines Grid */}
                {filteredMedicines.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
                        <Pill className="text-gray-300 mx-auto mb-4" size={64} />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            Không tìm thấy thuốc
                        </h3>
                        <p className="text-gray-600">
                            {searchTerm || statusFilter !== 'all'
                                ? 'Không có thuốc nào phù hợp với bộ lọc của bạn'
                                : 'Chưa có thuốc nào trong hệ thống'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMedicines.map(medicine => {
                            const expiringSoon = isExpiringSoon(medicine.expiry_date);
                            const expired = isExpired(medicine.expiry_date);
                            const daysLeft = getDaysUntilExpiry(medicine.expiry_date);
                            const lowStock = medicine.quantity < 50;

                            return (
                                <div
                                    key={medicine.id}
                                    className={`bg-white rounded-2xl shadow-lg border overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group ${expired ? 'border-red-300' : expiringSoon ? 'border-yellow-300' : 'border-gray-100'
                                        }`}
                                >
                                    {/* Header */}
                                    <div className={`relative text-white p-6 ${expired ? 'bg-gradient-to-br from-red-600 to-pink-700' :
                                        expiringSoon ? 'bg-gradient-to-br from-yellow-600 to-orange-700' :
                                            'bg-gradient-to-br from-blue-600 to-indigo-700'
                                        }`}>
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <p className="text-xs opacity-90 mb-1">{medicine.medicine_type}</p>
                                                <h3 className="text-lg font-bold mb-1">
                                                    {medicine.medicine_name}
                                                </h3>
                                                <p className="text-sm opacity-90">{medicine.dosage}</p>
                                            </div>
                                            {(expiringSoon || expired) && (
                                                <AlertTriangle size={24} />
                                            )}
                                        </div>
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(medicine.status)} bg-white`}>
                                            {getStatusText(medicine.status)}
                                        </span>
                                    </div>

                                    {/* Body */}
                                    <div className="p-6 space-y-3">
                                        {/* Expiry Warning */}
                                        {(expiringSoon || expired) && (
                                            <div className={`p-3 rounded-lg ${expired ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                                                <div className="flex items-center gap-2">
                                                    <AlertTriangle size={16} className={expired ? 'text-red-600' : 'text-yellow-600'} />
                                                    <p className={`text-sm font-bold ${expired ? 'text-red-700' : 'text-yellow-700'}`}>
                                                        {expired ? 'ĐÃ HẾT HẠN' : `Hết hạn trong ${daysLeft} ngày`}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Manufacturer */}
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Nhà sản xuất</p>
                                            <p className="text-sm font-semibold text-gray-900">{medicine.manufacturer}</p>
                                        </div>

                                        {/* Stock */}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Số lượng tồn</p>
                                                <p className={`text-lg font-bold ${lowStock ? 'text-orange-600' : 'text-gray-900'}`}>
                                                    {medicine.quantity} {medicine.unit}
                                                </p>
                                            </div>
                                            {lowStock && (
                                                <div className="flex items-center gap-1 text-orange-600 text-xs font-medium">
                                                    <TrendingDown size={14} />
                                                    <span>Sắp hết</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Expiry Date */}
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Hạn sử dụng</p>
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-gray-400" />
                                                <p className="text-sm font-medium text-gray-900">
                                                    {formatDate(medicine.expiry_date)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Đơn giá</p>
                                            <p className="text-lg font-bold text-green-600">
                                                {formatCurrency(medicine.price)}
                                            </p>
                                        </div>

                                        {/* Batch Number */}
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Số lô</p>
                                            <p className="text-sm font-mono text-gray-900">{medicine.batch_number}</p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-4 border-t border-gray-200">
                                            <button
                                                onClick={() => handleEditMedicine(medicine)}
                                                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 font-medium rounded-xl hover:bg-blue-100 transition-all duration-200"
                                            >
                                                <Edit2 size={16} />
                                                <span>Sửa</span>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteMedicine(medicine.id)}
                                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-all duration-200"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Results Count */}
                {filteredMedicines.length > 0 && (
                    <div className="mt-8 text-center">
                        <p className="text-gray-600">
                            Hiển thị <span className="font-bold text-blue-600">{filteredMedicines.length}</span> / {medicines.length} loại thuốc
                        </p>
                    </div>
                )}
            </div>

            {/* Medicine Modal */}
            {showMedicineModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm" onClick={() => setShowMedicineModal(false)} />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-t-2xl p-6 z-10">
                                <h2 className="text-2xl font-bold">
                                    {isEditMode ? 'Chỉnh sửa thuốc' : 'Thêm thuốc mới'}
                                </h2>
                                <p className="text-blue-100 mt-1">
                                    {isEditMode ? 'Cập nhật thông tin thuốc' : 'Điền thông tin để thêm thuốc mới'}
                                </p>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Tên thuốc <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={medicineForm.medicine_name}
                                        onChange={(e) => setMedicineForm({ ...medicineForm, medicine_name: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Paracetamol 500mg"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Loại thuốc
                                        </label>
                                        <input
                                            type="text"
                                            value={medicineForm.medicine_type}
                                            onChange={(e) => setMedicineForm({ ...medicineForm, medicine_type: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            placeholder="Giảm đau, hạ sốt"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Liều lượng
                                        </label>
                                        <input
                                            type="text"
                                            value={medicineForm.dosage}
                                            onChange={(e) => setMedicineForm({ ...medicineForm, dosage: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            placeholder="500mg"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Nhà sản xuất
                                    </label>
                                    <input
                                        type="text"
                                        value={medicineForm.manufacturer}
                                        onChange={(e) => setMedicineForm({ ...medicineForm, manufacturer: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="DHG Pharma"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Số lượng <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={medicineForm.quantity}
                                            onChange={(e) => setMedicineForm({ ...medicineForm, quantity: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            placeholder="500"
                                            min="0"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Đơn vị
                                        </label>
                                        <select
                                            value={medicineForm.unit}
                                            onChange={(e) => setMedicineForm({ ...medicineForm, unit: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                                        >
                                            <option value="Viên">Viên</option>
                                            <option value="Chai">Chai</option>
                                            <option value="Lọ">Lọ</option>
                                            <option value="Tuýp">Tuýp</option>
                                            <option value="Bộ">Bộ</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Đơn giá (VNĐ)
                                        </label>
                                        <input
                                            type="number"
                                            value={medicineForm.price}
                                            onChange={(e) => setMedicineForm({ ...medicineForm, price: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            placeholder="500"
                                            min="0"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Hạn sử dụng <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={medicineForm.expiry_date}
                                            onChange={(e) => setMedicineForm({ ...medicineForm, expiry_date: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Số lô
                                        </label>
                                        <input
                                            type="text"
                                            value={medicineForm.batch_number}
                                            onChange={(e) => setMedicineForm({ ...medicineForm, batch_number: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            placeholder="PCT-2024-001"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Trạng thái <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={medicineForm.status}
                                        onChange={(e) => setMedicineForm({ ...medicineForm, status: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                                    >
                                        <option value="AVAILABLE">Còn hàng</option>
                                        <option value="EXPIRING_SOON">Sắp hết hạn</option>
                                        <option value="LOW_STOCK">Sắp hết</option>
                                        <option value="OUT_OF_STOCK">Hết hàng</option>
                                    </select>
                                </div>
                            </div>

                            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl flex gap-3 justify-end">
                                <button
                                    onClick={() => setShowMedicineModal(false)}
                                    className="px-6 py-2.5 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleSaveMedicine}
                                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                                >
                                    {isEditMode ? 'Cập nhật' : 'Thêm thuốc'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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

export default MedicineList;
