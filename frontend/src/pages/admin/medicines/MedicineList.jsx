import React, { useState, useEffect } from 'react';
import { Pill } from 'lucide-react';
import inventoryService from '../../../services/inventoryService';
import Toast from '../../../components/ui/Toast';

// Components
import MedicineStats from './components/MedicineStats';
import MedicineFilter from './components/MedicineFilter';
import MedicineGrid from './components/MedicineGrid';
import SharedPagination from '../../../components/ui/SharedPagination';

const MedicineList = () => {
    // ========== STATE MANAGEMENT ==========
    const [medicines, setMedicines] = useState([]);
    const [filteredMedicines, setFilteredMedicines] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({ totalPages: 1, totalItems: 0 });
    const [stats, setStats] = useState({ totalMedicines: 0, expiringSoon: 0, lowStock: 0 });
    const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
    const [loading, setLoading] = useState(false);

    // ========== EFFECTS ==========
    const fetchStats = async () => {
        try {
            const res = await inventoryService.getDashboardStats();
            if (res.success && res.data) {
                // The backend returns: totalMedicines, lowStockCount, urgentStockCount, nearExpiredCount (checking backend)
                // Let's check dashboard.controller.js for exact field names
                setStats({
                    totalMedicines: res.data.totalMedicines || 0,
                    expiringSoon: res.data.nearExpiredCount || 0,
                    lowStock: res.data.lowStockCount || 0
                });
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchMedicines = async (search = searchTerm, filter = statusFilter, page = currentPage) => {
        try {
            setLoading(true);
            const params = { page, limit: 6 };
            if (search) params.search = search;
            if (filter !== 'all') params.statusFilter = filter;

            const res = await inventoryService.getMedicines(params);
            if (res.success && res.data) {
                // The response structure is { success: true, data: Array, pagination: Object }
                setMedicines(res.data);
                setFilteredMedicines(res.data);
                if (res.pagination) {
                    setPagination({
                        totalPages: res.pagination.totalPages,
                        totalItems: res.pagination.totalItems
                    });
                }
            }
        } catch (error) {
            console.error("Error fetching medicines:", error);
            setToast({
                show: true,
                type: 'error',
                message: 'Không thể tải danh sách thuốc từ server.'
            });
        } finally {
            setLoading(false);
        }
    };

    // Refetch logic: Debounce for search, immediate for filter/page
    useEffect(() => {
        const isSearchChange = searchTerm !== ''; // Simple check, or track previous

        const timer = setTimeout(() => {
            fetchMedicines(searchTerm, statusFilter, currentPage);
        }, isSearchChange ? 500 : 0);

        return () => clearTimeout(timer);
    }, [searchTerm, statusFilter, currentPage]);

    // Reset to page 1 when search or filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

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

    // ========== RENDER HELPERS ==========
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

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
                    totalMedicines={stats.totalMedicines}
                    expiringSoon={stats.expiringSoon}
                    lowStock={stats.lowStock}
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

                {/* Pagination */}
                <SharedPagination
                    currentPage={currentPage}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.totalItems}
                    onPageChange={setCurrentPage}
                    itemLabel="loại thuốc"
                />

                {/* Results Count Summary (Optional, since SharedPagination shows it) */}
                {filteredMedicines.length > 0 && !loading && (
                    <div className="mt-4 text-center text-gray-400 text-xs">
                        Đang hiển thị {filteredMedicines.length} sản phẩm trên trang này
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
