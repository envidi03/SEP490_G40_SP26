import React, { useState, useEffect } from 'react';
import { Pill } from 'lucide-react';
import inventoryService from '../../../services/inventoryService';
import Toast from '../../../components/ui/Toast';

// Components
import MedicineStats from './components/MedicineStats';
import MedicineFilter from './components/MedicineFilter';
import MedicineGrid from './components/MedicineGrid';

const MedicineList = () => {
    // ========== STATE MANAGEMENT ==========
    const [medicines, setMedicines] = useState([]);
    const [filteredMedicines, setFilteredMedicines] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

    const [loading, setLoading] = useState(false);

    // ========== EFFECTS ==========
    const fetchMedicines = async () => {
        try {
            setLoading(true);
            const res = await inventoryService.getMedicines({ page: 1, limit: 1000 });
            if (res.success && res.data) {
                setMedicines(res.data);
                setFilteredMedicines(res.data);
            }
        } catch (error) {
            console.error("Error fetching medicines:", error);
            setToast({
                show: true,
                type: 'error',
                message: '❌ Không thể tải danh sách thuốc từ server.'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedicines();
    }, []);

    useEffect(() => {
        let filtered = medicines;

        if (statusFilter !== 'all') {
            if (statusFilter === 'EXPIRED') {
                filtered = filtered.filter(m => isExpired(m.expiry_date) || m.status === 'EXPIRED');
            } else {
                filtered = filtered.filter(m => m.status === statusFilter && !isExpired(m.expiry_date));
            }
        }

        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(m =>
                m.medicine_name?.toLowerCase().includes(searchLower) ||
                m.category?.toLowerCase().includes(searchLower) ||
                m.manufacturer?.toLowerCase().includes(searchLower)
            );
        }

        setFilteredMedicines(filtered);
    }, [searchTerm, statusFilter, medicines]);

    // ========== HELPER FUNCTIONS ==========
    const isExpiringSoon = (expiryDate) => {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        return diffDays <= 60 && diffDays >= 0;
    };

    const isExpired = (expiryDate) => {
        const today = new Date();
        const expiry = new Date(expiryDate);
        return expiry < today;
    };

    const getDaysUntilExpiry = (expiryDate) => {
        const today = new Date();
        const expiry = new Date(expiryDate);
        return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    };

    const getStatusColor = (status) => {
        const colors = {
            'AVAILABLE': 'bg-green-100 text-green-700 border-green-200',
            'EXPIRING_SOON': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'LOW_STOCK': 'bg-orange-100 text-orange-700 border-orange-200',
            'OUT_OF_STOCK': 'bg-red-100 text-red-700 border-red-200',
            'EXPIRED': 'bg-red-800 text-white border-red-900'
        };
        return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const getStatusText = (status) => {
        const texts = {
            'AVAILABLE': 'Còn hàng',
            'EXPIRING_SOON': 'Sắp hết hạn',
            'LOW_STOCK': 'Sắp hết',
            'OUT_OF_STOCK': 'Hết hàng',
            'EXPIRED': 'Đã hết hạn'
        };
        return texts[status] || status;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    // Calculate statistics
    const totalMedicines = medicines.length;
    const expiringSoon = medicines.filter(m => isExpiringSoon(m.expiry_date)).length;
    const lowStock = medicines.filter(m => m.quantity < 50).length;

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
                </div>

                <MedicineStats
                    totalMedicines={totalMedicines}
                    expiringSoon={expiringSoon}
                    lowStock={lowStock}
                />

                <MedicineFilter
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                />

                <MedicineGrid
                    medicines={filteredMedicines}
                    isExpiringSoon={isExpiringSoon}
                    isExpired={isExpired}
                    getDaysUntilExpiry={getDaysUntilExpiry}
                    getStatusColor={getStatusColor}
                    getStatusText={getStatusText}
                    formatCurrency={formatCurrency}
                    searchTerm={searchTerm}
                    statusFilter={statusFilter}
                />

                {/* Results Count */}
                {filteredMedicines.length > 0 && (
                    <div className="mt-8 text-center text-gray-500 text-sm">
                        Hiển thị <span className="font-bold text-gray-900">{filteredMedicines.length}</span> / {medicines.length} loại thuốc
                    </div>
                )}
            </div>

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
