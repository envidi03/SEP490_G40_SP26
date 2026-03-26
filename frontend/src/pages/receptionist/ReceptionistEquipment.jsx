import React, { useState, useEffect, useMemo } from 'react';
import { Wrench, Search, AlertCircle, CheckCircle, Settings, Loader2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Toast from '../../components/ui/Toast';
import equipmentService from '../../services/equipmentService';
import UpdateMaintenanceModal from './components/modals/UpdateMaintenanceModal';

import EquipmentPagination from '../admin/equipments/components/EquipmentPagination';

const ReceptionistEquipment = () => {
    const [equipments, setEquipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [toast, setToast] = useState({ show: false, type: '', message: '' });
    const [expandedCategories, setExpandedCategories] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 6,
        totalItems: 0,
        totalPages: 0
    });

    // --- FETCH DATA TỪ API ---
    const fetchEquipments = async (page = pagination.page) => {
        setLoading(true);
        try {
            const response = await equipmentService.getEquipments({
                page,
                limit: pagination.limit,
                search: searchTerm || undefined,
                status: filterStatus !== 'all' ? filterStatus : undefined,
            });
            const data = response?.data?.data || response?.data || [];
            setEquipments(Array.isArray(data) ? data : data.data || []);

            if (response?.pagination) {
                setPagination(prev => ({
                    ...prev,
                    ...response.pagination,
                    page: response.pagination.page // Đảm bảo đồng bộ
                }));
            }

            // Lần đầu tải xong hoặc khi đổi trang, có thể giữ hoặc mở lại category
            if (expandedCategories.length === 0 && Array.isArray(data)) {
                const hasItems = data.filter(cat => cat.equipment?.length > 0).map(cat => cat.equipment_type);
                setExpandedCategories(hasItems);
            }
        } catch (error) {
            console.error('Error fetching equipments:', error);
            setToast({ show: true, type: 'error', message: 'Lỗi khi tải danh sách thiết bị' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEquipments(1);
    }, [searchTerm, filterStatus]);

    const handlePageChange = (newPage) => {
        fetchEquipments(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // --- LỌC PHÍA CLIENT (Nếu cần thiết, nhưng thường Pagination nên đi kèm Server-side) ---
    const displayedCategories = useMemo(() => {
        return equipments
            .filter(category => category.status === 'ACTIVE') // Chỉ hiển thị danh mục ACTIVE
            .map(category => {
                const filteredItems = (category.equipment || []).filter(item => {
                    const name = item.equipment_name || '';
                    const serial = item.equipment_serial_number || '';
                    const type = category.equipment_type || '';

                    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        serial.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        type.toLowerCase().includes(searchTerm.toLowerCase());

                    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;

                    return matchesSearch && matchesStatus;
                });

                return {
                    ...category,
                    filteredEquipment: filteredItems
                };
            });
    }, [equipments, searchTerm, filterStatus]);

    // --- MAP TRẠNG THÁI ---
    const getStatusInfo = (status) => {
        switch (status) {
            case 'READY':
                return { variant: 'success', label: 'Sẵn sàng' };
            case 'IN_USE':
                return { variant: 'primary', label: 'Đang sử dụng' };
            case 'MAINTENANCE':
                return { variant: 'warning', label: 'Bảo trì' };
            case 'REPAIRING':
                return { variant: 'warning', label: 'Đang sửa chữa' };
            case 'FAULTY':
                return { variant: 'danger', label: 'Hỏng' };
            case 'STERILIZING':
                return { variant: 'info', label: 'Đang khử trùng' };
            default:
                return { variant: 'default', label: status || 'N/A' };
        }
    };

    // --- HANDLERS ---
    const handleUpdateClick = (equipment) => {
        setSelectedEquipment(equipment);
        setShowUpdateModal(true);
    };

    const closeModal = () => {
        setShowUpdateModal(false);
        setSelectedEquipment(null);
    };

    const toggleCategory = (type) => {
        setExpandedCategories(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
    };

    const handleUpdateMaintenance = async (equipmentId, data) => {
        try {
            if (data.status) {
                await equipmentService.updateEquipmentStatus(equipmentId, data.status);
            }

            setToast({ show: true, type: 'success', message: '✅ Cập nhật bảo trì thành công!' });
            closeModal();
            fetchEquipments(pagination.page);
        } catch (error) {
            console.error('Error updating maintenance:', error);
            setToast({
                show: true,
                type: 'error',
                message: error?.data?.message || 'Lỗi khi cập nhật thiết bị. Vui lòng thử lại!'
            });
        }
    };

    // --- THỐNG KÊ ---
    const totalCount = useMemo(() => {
        return equipments.reduce((acc, cat) => acc + (cat.equipment?.length || 0), 0);
    }, [equipments]);

    const activeCount = useMemo(() => {
        return equipments.reduce((acc, cat) => {
            return acc + (cat.equipment?.filter(eq => eq.status === 'READY' || eq.status === 'IN_USE').length || 0);
        }, 0);
    }, [equipments]);

    const maintenanceCount = useMemo(() => {
        return equipments.reduce((acc, cat) => {
            return acc + (cat.equipment?.filter(eq => ['MAINTENANCE', 'REPAIRING', 'FAULTY'].includes(eq.status)).length || 0);
        }, 0);
    }, [equipments]);

    return (
        <div className="min-h-screen bg-transparent pb-12">
            {/* Header */}
            <div className="mb-8 flex justify-between items-center px-1">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Quản Lý Thiết Bị</h1>
                    <p className="text-gray-500 mt-1 font-medium">Theo dõi thiết bị và lịch trình bảo trì phòng khám</p>
                </div>
                <button
                    onClick={() => fetchEquipments(1)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm font-semibold text-sm"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    Làm mới dữ liệu
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Tổng thiết bị</p>
                        <p className="text-3xl font-black text-gray-900 mt-1">{pagination.totalItems || totalCount}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-2xl text-blue-600 shadow-inner">
                        <Wrench size={28} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Đang hoạt động</p>
                        <p className="text-3xl font-black text-green-600 mt-1">{activeCount}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-2xl text-green-600 shadow-inner">
                        <CheckCircle size={28} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Cần bảo trì / Hỏng</p>
                        <p className="text-3xl font-black text-orange-600 mt-1">{maintenanceCount}</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-2xl text-orange-600 shadow-inner">
                        <AlertCircle size={28} />
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 relative w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm thiết bị, mã serial, hoặc loại thiết bị..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-700 placeholder:text-gray-400"
                    />
                </div>

                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full md:w-64 px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-bold text-gray-700 appearance-none cursor-pointer"
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="READY">Sẵn sàng</option>
                    <option value="IN_USE">Đang sử dụng</option>
                    <option value="MAINTENANCE">Đang bảo trì</option>
                    <option value="REPAIRING">Đang sửa chữa</option>
                    <option value="FAULTY">Hỏng</option>
                    <option value="STERILIZING">Đang khử trùng</option>
                </select>
            </div>

            {/* Grouped Equipment Cards (Admin Style) */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24">
                    <Loader2 size={48} className="text-blue-500 animate-spin mb-4" />
                    <p className="text-gray-500 font-bold tracking-wide">ĐANG TẢI DỮ LIỆU...</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {displayedCategories.map((category) => {
                        const isExpanded = expandedCategories.includes(category.equipment_type);
                        const items = category.filteredEquipment || [];
                        const categoryId = category._id || category.id;

                        return (
                            <div key={categoryId} className="group">
                                {/* Category Horizontal Card */}
                                <div
                                    onClick={() => toggleCategory(category.equipment_type)}
                                    className="flex items-center justify-between p-5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-1.5 h-10 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.3)]"></div>
                                        <div>
                                            <h2 className="text-lg font-extrabold text-gray-800 group-hover:text-blue-600 transition-colors">
                                                {category.equipment_type}
                                            </h2>
                                            <p className="text-sm text-gray-400 font-bold mt-0.5">
                                                Tổng cộng: {category.equipment?.length || 0} thiết bị
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {/* Category Status */}
                                        <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border ${category.status === 'ACTIVE'
                                                ? 'bg-green-50 text-green-600 border-green-100'
                                                : 'bg-red-50 text-red-600 border-red-100'
                                            }`}>
                                            {category.status === 'ACTIVE' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                                        </span>

                                        <div className="p-2 bg-gray-50 rounded-full text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
                                            {isExpanded ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
                                        </div>
                                    </div>
                                </div>

                                {/* Items Table/List (When expanded) */}
                                {isExpanded && (
                                    <div className="mt-4 ml-4 pl-6 border-l-2 border-dashed border-gray-200 animate-in fade-in slide-in-from-top-4 duration-500">
                                        {items.length > 0 ? (
                                            <div className="bg-white rounded-2xl shadow-inner border border-gray-100 overflow-hidden">
                                                <table className="w-full text-left">
                                                    <thead>
                                                        <tr className="bg-gray-50/50 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                                            <th className="px-6 py-4">Tên thiết bị</th>
                                                            <th className="px-6 py-4">Số Serial</th>
                                                            <th className="px-6 py-4">Nhà cung cấp</th>
                                                            <th className="px-6 py-4 text-center">Trạng thái</th>
                                                            <th className="px-6 py-4 text-center">Thao tác</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50">
                                                        {items.map((item) => {
                                                            const statusInfo = getStatusInfo(item.status);
                                                            return (
                                                                <tr key={item._id} className="hover:bg-gray-50/80 transition-colors font-medium text-sm text-gray-600">
                                                                    <td className="px-6 py-4 font-extrabold text-gray-900">{item.equipment_name}</td>
                                                                    <td className="px-6 py-4 font-mono text-xs">{item.equipment_serial_number || '—'}</td>
                                                                    <td className="px-6 py-4">{item.supplier || '—'}</td>
                                                                    <td className="px-6 py-4 text-center">
                                                                        <Badge variant={statusInfo.variant} className="font-bold text-[10px] uppercase px-3 shadow-none">
                                                                            {statusInfo.label}
                                                                        </Badge>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-center">
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleUpdateClick({ ...item, equipment_type: category.equipment_type });
                                                                            }}
                                                                            className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-sm active:scale-95"
                                                                            title="Cập nhật bảo trì"
                                                                        >
                                                                            <Settings size={18} />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-center">
                                                <p className="text-gray-400 font-bold italic">Không có thiết bị con nào khớp với tìm kiếm</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {displayedCategories.length === 0 && (
                        <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                            <Wrench size={64} className="mx-auto text-gray-200 mb-6" />
                            <h3 className="text-xl font-black text-gray-900 mb-2">Không tìm thấy danh mục nào</h3>
                            <p className="text-gray-400 font-bold">Thử thay đổi từ khóa hoặc bộ lọc của bạn</p>
                        </div>
                    )}

                    <EquipmentPagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.totalItems}
                        pageSize={pagination.limit}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}

            {/* Modals */}
            <UpdateMaintenanceModal
                isOpen={showUpdateModal}
                equipment={selectedEquipment}
                onUpdate={handleUpdateMaintenance}
                onClose={closeModal}
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

export default ReceptionistEquipment;
