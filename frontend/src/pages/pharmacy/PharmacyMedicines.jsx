import React, { useState, useEffect, useCallback } from 'react';
import { Pill, Search, Plus, Edit, AlertTriangle, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import PharmacyMedicineModal from './PharmacyMedicineModal';
import inventoryService from '../../services/inventoryService';

const PharmacyMedicines = () => {
    const [medicines, setMedicines] = useState([]);
    const [categories, setCategories] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter / search state
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const LIMIT = 10;

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Fetch categories once
    useEffect(() => {
        inventoryService.getCategories()
            .then(res => {
                if (res?.success) setCategories(res.data || []);
            })
            .catch(err => console.error('Lỗi lấy danh mục:', err));
    }, []);

    // Fetch medicines whenever filters change (debounced search)
    const fetchMedicines = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage,
                limit: LIMIT,
                ...(searchTerm.trim() && { search: searchTerm.trim() }),
                ...(filterCategory !== 'all' && { category: filterCategory }),
            };
            const res = await inventoryService.getMedicines(params);
            if (res?.success) {
                setMedicines(res.data || []);
                setPagination(res.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 });
            }
        } catch (err) {
            console.error('Lỗi lấy danh sách thuốc:', err);
            setError('Không thể tải danh sách thuốc. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    }, [currentPage, filterCategory, searchTerm]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(1); // reset về trang 1 khi search/filter thay đổi
            fetchMedicines();
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm, filterCategory]);

    // Fetch khi page thay đổi (không debounce)
    useEffect(() => {
        fetchMedicines();
    }, [currentPage]);

    const lowStockCount = medicines.filter(m => m.quantity < m.min_quantity).length;

    const handleOpenAdd = () => {
        setEditData(null);
        setModalOpen(true);
    };

    const handleOpenEdit = async (medicine) => {
        try {
            // Gọi API detail để lấy đầy đủ tất cả fields (list API chỉ trả về field tóm tắt)
            const res = await inventoryService.getMedicineById(medicine._id);
            const med = res?.data || medicine; // fallback về list data nếu lỗi

            setEditData({
                id: med._id,
                name: med.medicine_name,
                category: med.category,
                dosage: med.dosage,
                dosage_form: med.dosage_form,
                unit: med.unit,
                price: med.price,
                manufacturer: med.manufacturer,
                distributor: med.distributor,
                expiryDate: med.expiry_date?.slice(0, 10),
                stock: med.quantity,
                minStock: med.min_quantity,
                batchNumber: med.batch_number,
            });
        } catch (err) {
            console.error('Lỗi lấy chi tiết thuốc:', err);
            // Fallback: dùng data từ list (có thể thiếu một số field)
            setEditData({
                id: medicine._id,
                name: medicine.medicine_name,
                category: medicine.category,
                dosage: medicine.dosage,
                dosage_form: medicine.dosage_form,
                unit: medicine.unit,
                price: medicine.price,
                manufacturer: medicine.manufacturer,
                distributor: medicine.distributor,
                expiryDate: medicine.expiry_date?.slice(0, 10),
                stock: medicine.quantity,
                minStock: medicine.min_quantity,
                batchNumber: medicine.batch_number,
            });
        }
        setModalOpen(true);
    };

    const handleModalSubmit = async (data, isEdit) => {
        setSubmitting(true);
        try {
            // Map fields sang format API
            const payload = {
                medicine_name: data.name,
                category: data.category,
                dosage: data.dosage,
                dosage_form: data.dosage_form,
                unit: data.unit,
                price: Number(data.price),
                manufacturer: data.manufacturer,
                distributor: data.distributor,
                expiry_date: data.expiryDate,
                quantity: Number(data.stock),
                min_quantity: Number(data.minStock),
                batch_number: data.batchNumber,
            };

            if (isEdit) {
                await inventoryService.updateMedicine(data.id, payload);
            } else {
                await inventoryService.createMedicine(payload);
            }

            setModalOpen(false);
            // Refetch trang hiện tại
            fetchMedicines();
        } catch (err) {
            console.error('Lỗi lưu thuốc:', err);
            alert(err?.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin thuốc.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleCategoryChange = (e) => {
        setFilterCategory(e.target.value);
        setCurrentPage(1);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('vi-VN');
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Quản Lý Thuốc</h1>
                <p className="text-gray-600 mt-1">Danh mục và thông tin thuốc</p>
            </div>

            {/* Low stock alert */}
            {!loading && lowStockCount > 0 && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
                    <AlertTriangle className="text-yellow-600" size={24} />
                    <div>
                        <p className="font-medium text-yellow-800">Cảnh báo tồn kho thấp</p>
                        <p className="text-sm text-yellow-700">Có {lowStockCount} loại thuốc sắp hết hàng trên trang này</p>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                    <AlertTriangle className="text-red-600" size={24} />
                    <div className="flex-1">
                        <p className="font-medium text-red-800">{error}</p>
                    </div>
                    <button
                        onClick={fetchMedicines}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                        Thử lại
                    </button>
                </div>
            )}

            {/* Filters */}
            <Card className="mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm thuốc theo tên, nhà sản xuất..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <select
                        value={filterCategory}
                        onChange={handleCategoryChange}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="all">Tất cả danh mục</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    <button
                        onClick={handleOpenAdd}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Thêm thuốc
                    </button>
                </div>
            </Card>

            {/* Medicines Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên thuốc</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Danh mục</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NSX</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Giá</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tồn kho</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">HSD</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
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
                            ) : medicines.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        Không tìm thấy thuốc nào
                                    </td>
                                </tr>
                            ) : (
                                medicines.map((medicine) => (
                                    <tr key={medicine._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                                    <Pill size={20} className="text-blue-600" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{medicine.medicine_name}</div>
                                                    <div className="text-xs text-gray-500">{medicine.unit}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900">{medicine.category}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-600">{medicine.manufacturer}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-sm font-medium text-gray-900">
                                                {medicine.price?.toLocaleString('vi-VN')}đ
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <Badge variant={medicine.quantity < medicine.min_quantity ? 'danger' : 'success'}>
                                                <Package size={14} className="inline mr-1" />
                                                {medicine.quantity?.toLocaleString('vi-VN')}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-600">{formatDate(medicine.expiry_date)}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button
                                                onClick={() => handleOpenEdit(medicine)}
                                                className="text-primary-600 hover:text-primary-900 p-2 hover:bg-primary-50 rounded"
                                                title="Chỉnh sửa"
                                            >
                                                <Edit size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                            Hiển thị {medicines.length} / {pagination.totalItems} thuốc
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

            {/* Add / Edit Medicine Modal */}
            <PharmacyMedicineModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleModalSubmit}
                editData={editData}
                submitting={submitting}
            />
        </div>
    );
};

export default PharmacyMedicines;
