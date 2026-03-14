import React, { useState, useEffect, useMemo } from 'react';
import { Wrench, Search, AlertCircle, CheckCircle, Settings, Loader2, RefreshCw } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Toast from '../../components/ui/Toast';
import equipmentService from '../../services/equipmentService';
import UpdateMaintenanceModal from './components/modals/UpdateMaintenanceModal';

const ReceptionistEquipment = () => {
    const [equipments, setEquipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [toast, setToast] = useState({ show: false, type: '', message: '' });

    // --- FETCH DATA TỪ API ---
    const fetchEquipments = async () => {
        setLoading(true);
        try {
            const response = await equipmentService.getEquipments({
                search: searchTerm || undefined,
                status: filterStatus !== 'all' ? filterStatus : undefined,
            });
            const data = response?.data?.data || response?.data || [];
            setEquipments(Array.isArray(data) ? data : data.data || []);
        } catch (error) {
            console.error('Error fetching equipments:', error);
            setToast({ show: true, type: 'error', message: '❌ Lỗi khi tải danh sách thiết bị' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEquipments();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // --- LỌC PHÍA CLIENT (cho search nhanh mà không cần gọi API lại) ---
    const filteredEquipment = useMemo(() => {
        return equipments.filter(eq => {
            const name = eq.equipment_name || '';
            const code = eq.equipment_serial_number || '';
            const type = eq.equipment_type || '';
            const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                type.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'all' || eq.status === filterStatus;
            return matchesSearch && matchesStatus;
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

    const handleUpdateMaintenance = async (equipmentId, data) => {
        try {
            // Gọi API cập nhật trạng thái
            if (data.status) {
                await equipmentService.updateEquipmentStatus(equipmentId, data.status);
            }

            setToast({ show: true, type: 'success', message: '✅ Cập nhật bảo trì thành công!' });
            closeModal();
            // Reload danh sách từ API
            fetchEquipments();
        } catch (error) {
            console.error('Error updating maintenance:', error);
            setToast({
                show: true,
                type: 'error',
                message: error?.data?.message || '❌ Lỗi khi cập nhật thiết bị. Vui lòng thử lại!'
            });
        }
    };

    // --- THỐNG KÊ ---
    const totalCount = equipments.length;
    const activeCount = equipments.filter(eq => eq.status === 'READY' || eq.status === 'IN_USE').length;
    const maintenanceCount = equipments.filter(eq => ['MAINTENANCE', 'REPAIRING', 'FAULTY'].includes(eq.status)).length;

    return (
        <div>
            {/* Header */}
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Quản Lý Thiết Bị</h1>
                    <p className="text-gray-600 mt-1">Theo dõi thiết bị và lịch bảo trì</p>
                </div>
                <button
                    onClick={fetchEquipments}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Tải lại
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Tổng thiết bị</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{totalCount}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <Wrench size={24} className="text-blue-600" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Đang hoạt động</p>
                            <p className="text-3xl font-bold text-green-600 mt-1">{activeCount}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                            <CheckCircle size={24} className="text-green-600" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Cần bảo trì / Hỏng</p>
                            <p className="text-3xl font-bold text-orange-600 mt-1">{maintenanceCount}</p>
                        </div>
                        <div className="p-3 bg-orange-100 rounded-full">
                            <AlertCircle size={24} className="text-orange-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm thiết bị, mã thiết bị, loại..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
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
            </Card>

            {/* Equipment Table */}
            <Card>
                {loading ? (
                    <div className="text-center py-16">
                        <Loader2 size={40} className="mx-auto text-primary-500 animate-spin mb-4" />
                        <p className="text-gray-500">Đang tải danh sách thiết bị...</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thiết bị</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số Serial</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại TB</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nhà cung cấp</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredEquipment.map((equipment) => {
                                        const statusInfo = getStatusInfo(equipment.status);

                                        return (
                                            <tr key={equipment._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <span className="text-sm font-medium text-gray-900">{equipment.equipment_name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-600">{equipment.equipment_serial_number || '—'}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-900">{equipment.equipment_type}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-600">{equipment.supplier || '—'}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <Badge variant={statusInfo.variant}>
                                                        {statusInfo.label}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <button
                                                        onClick={() => handleUpdateClick(equipment)}
                                                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
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

                        {filteredEquipment.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                Không tìm thấy thiết bị nào
                            </div>
                        )}
                    </>
                )}
            </Card>

            {/* Update Maintenance Modal */}
            <UpdateMaintenanceModal
                equipment={selectedEquipment}
                isOpen={showUpdateModal}
                onClose={closeModal}
                onUpdate={handleUpdateMaintenance}
            />

            {/* Toast */}
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
