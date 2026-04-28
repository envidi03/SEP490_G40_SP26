import React, { useState, useEffect, useCallback } from 'react';
import { Package, TrendingDown, TrendingUp, AlertCircle, Search, ChevronLeft, ChevronRight, Plus, Trash2, X } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import inventoryService from '../../services/inventoryService';

const PharmacyInventory = () => {
    const [inventory, setInventory] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const LIMIT = 10;

    // --- STATE CHO MODAL NHẬP THUỐC ---
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importForms, setImportForms] = useState([{ medicineId: '', quantity: 1 }]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Stats tính từ danh sách hiện tại trên trang (server đã sort quantity tăng dần)
    const totalStockOnPage = inventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const lowStockItems = inventory.filter(item => item.stock_status === 'Thấp');
    const criticalItems = inventory.filter(item => item.stock_status === 'Hết hàng');

    const fetchInventory = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage,
                limit: LIMIT,
                ...(searchTerm.trim() && { search: searchTerm.trim() }),
            };
            const res = await inventoryService.getStockTracking(params);
            if (res?.success) {
                setInventory(res.data || []);
                setPagination(res.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 });
            }
        } catch (err) {
            console.error('Lỗi tải dữ liệu tồn kho:', err);
            setError('Không thể tải dữ liệu tồn kho. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(1);
            fetchInventory();
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm, fetchInventory]);

    // Fetch khi page thay đổi
    useEffect(() => {
        fetchInventory();
    }, [currentPage, fetchInventory]);

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('vi-VN');
    };

    const getStockBadge = (stockStatus) => {
        switch (stockStatus) {
            case 'Hết hàng':
                return <Badge variant="danger">Hết hàng</Badge>;
            case 'Thấp':
                return <Badge variant="warning">Thấp</Badge>;
            default:
                return <Badge variant="success">Đủ hàng</Badge>;
        }
    };

    const getTrendIcon = (stockStatus) => {
        if (stockStatus === 'Hết hàng') return <TrendingDown className="text-red-500" size={16} />;
        if (stockStatus === 'Thấp') return <TrendingDown className="text-yellow-500" size={16} />;
        return <TrendingUp className="text-green-500" size={16} />;
    };

    const getProgressBarColor = (stockStatus) => {
        if (stockStatus === 'Hết hàng') return 'bg-red-500';
        if (stockStatus === 'Thấp') return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getProgressPercent = (quantity, minQuantity) => {
        if (!minQuantity || minQuantity === 0) return quantity > 0 ? 100 : 0;
        return Math.min(100, Math.round((quantity / (minQuantity * 2)) * 100));
    };

    // --- LOGIC XỬ LÝ MODAL NHẬP THUỐC ---
    const openImportModal = () => {
        setImportForms([{ medicineId: '', quantity: 1 }]);
        setIsImportModalOpen(true);
    };

    const handleAddFormRow = () => {
        setImportForms([...importForms, { medicineId: '', quantity: 1 }]);
    };

    const handleRemoveFormRow = (index) => {
        const newForms = importForms.filter((_, i) => i !== index);
        setImportForms(newForms);
    };

    const handleFormChange = (index, field, value) => {
        const newForms = [...importForms];
        newForms[index][field] = value;
        setImportForms(newForms);
    };

    const handleSubmitImport = async () => {
        // Lọc bỏ các dòng chưa chọn thuốc hoặc số lượng không hợp lệ
        const validData = importForms.filter(form => form.medicineId && form.quantity > 0);

        if (validData.length === 0) {
            alert('Vui lòng chọn thuốc và nhập số lượng hợp lệ!');
            return;
        }

        setIsSubmitting(true);
        try {
            for (const form of validData) {
                await inventoryService.importMedicines(form.medicineId, { quantity: form.quantity });
            }
            alert('Nhập thuốc thành công!');
            setIsImportModalOpen(false);
            fetchInventory(); // Reload lại table sau khi nhập thành công
        } catch (error) {
            console.error('Lỗi khi nhập thuốc:', error);
            alert('Có lỗi xảy ra khi nhập thuốc.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative">
            {/* Header */}
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Theo Dõi Tồn Kho</h1>
                    <p className="text-gray-600 mt-1">Quản lý và theo dõi số lượng thuốc</p>
                </div>
                <button
                    onClick={openImportModal}
                    className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <Plus size={20} />
                    <span>Nhập thuốc</span>
                </button>
            </div>

            {/* Các thành phần hiện tại (Stats, Search, Table, Pagination) giữ nguyên */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Tổng (trang này)</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">
                                {loading ? '—' : totalStockOnPage.toLocaleString('vi-VN')}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {pagination.totalItems} loại thuốc
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <Package size={24} className="text-blue-600" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Sắp hết hàng</p>
                            <p className="text-3xl font-bold text-yellow-600 mt-1">
                                {loading ? '—' : lowStockItems.length}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Dưới mức tối thiểu</p>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded-full">
                            <AlertCircle size={24} className="text-yellow-600" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Hết hàng</p>
                            <p className="text-3xl font-bold text-red-600 mt-1">
                                {loading ? '—' : criticalItems.length}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Cần nhập gấp</p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-full">
                            <TrendingDown size={24} className="text-red-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                    <p className="text-red-700 text-sm">{error}</p>
                    <button
                        onClick={fetchInventory}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                        Thử lại
                    </button>
                </div>
            )}

            <Card className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm thuốc theo tên..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                </div>
            </Card>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên thuốc</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tồn kho</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tối thiểu</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-40">Mức tồn</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nhập lần cuối</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Xu hướng</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3"></div>
                                        <p className="text-gray-500 text-sm">Đang tải...</p>
                                    </td>
                                </tr>
                            ) : inventory.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        Không tìm thấy dữ liệu tồn kho
                                    </td>
                                </tr>
                            ) : (
                                inventory.map((item) => {
                                    const percent = getProgressPercent(item.quantity, item.min_quantity);
                                    return (
                                        <tr key={item._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-gray-900">{item.medicine_name}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`text-lg font-bold ${item.stock_status === 'Hết hàng'
                                                    ? 'text-red-600'
                                                    : item.stock_status === 'Thấp'
                                                        ? 'text-yellow-600'
                                                        : 'text-gray-900'
                                                    }`}>
                                                    {item.quantity?.toLocaleString('vi-VN') ?? 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-sm text-gray-600">
                                                    {item.min_quantity?.toLocaleString('vi-VN') ?? '—'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full transition-all ${getProgressBarColor(item.stock_status)}`}
                                                            style={{ width: `${percent}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-gray-500 w-8 text-right">{percent}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {getStockBadge(item.stock_status)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-600">
                                                    {formatDate(item.last_import_date)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {getTrendIcon(item.stock_status)}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                            Hiển thị {inventory.length} / {pagination.totalItems} loại thuốc
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <span className="text-sm text-gray-700">
                                Trang {pagination.currentPage} / {pagination.totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                                disabled={currentPage === pagination.totalPages}
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </Card>

            {/* --- MODAL NHẬP THUỐC --- */}
            {isImportModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">

                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Nhập Thuốc Mới</h2>
                            <button
                                onClick={() => setIsImportModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="space-y-4">
                                {importForms.map((form, index) => (
                                    <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Chọn thuốc
                                            </label>
                                            <select
                                                value={form.medicineId}
                                                onChange={(e) => handleFormChange(index, 'medicineId', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-white"
                                            >
                                                <option value="">-- Chọn thuốc --</option>
                                                {/* Giả định dùng mảng inventory làm danh sách chọn. 
                                                    Thực tế bạn nên gọi API lấy Master list danh sách thuốc */}
                                                {inventory.map(item => (
                                                    <option key={item._id} value={item._id}>
                                                        {item.medicine_name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="w-32">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Số lượng
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={form.quantity}
                                                onChange={(e) => handleFormChange(index, 'quantity', parseInt(e.target.value) || 0)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                                            />
                                        </div>
                                        {importForms.length > 1 && (
                                            <div className="pt-7">
                                                <button
                                                    onClick={() => handleRemoveFormRow(index)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                                    title="Xóa dòng"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleAddFormRow}
                                className="mt-4 flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm"
                            >
                                <Plus size={16} /> Thêm dòng khác
                            </button>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                            <button
                                onClick={() => setIsImportModalOpen(false)}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                disabled={isSubmitting}
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleSubmitImport}
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-primary-400 flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Đang xử lý...
                                    </>
                                ) : (
                                    'Xác nhận nhập'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PharmacyInventory;