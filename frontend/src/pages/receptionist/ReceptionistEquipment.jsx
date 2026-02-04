import React, { useState } from 'react';
import { Wrench, Search, AlertCircle, CheckCircle, Settings } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import UpdateMaintenanceModal from './components/modals/UpdateMaintenanceModal';

// Mock Equipment Data
const mockEquipment = [
    {
        id: 'eq_001',
        name: 'Máy X-quang Panoramic',
        code: 'XRAY-001',
        category: 'Chẩn đoán hình ảnh',
        location: 'Phòng 101',
        status: 'active',
        lastMaintenance: '2025-12-15',
        nextMaintenance: '2026-03-15'
    },
    {
        id: 'eq_002',
        name: 'Ghế nha khoa Belmont',
        code: 'CHAIR-001',
        category: 'Thiết bị điều trị',
        location: 'Phòng 102',
        status: 'active',
        lastMaintenance: '2026-01-05',
        nextMaintenance: '2026-04-05'
    },
    {
        id: 'eq_003',
        name: 'Máy cạo vôi siêu âm',
        code: 'SCALER-001',
        category: 'Thiết bị điều trị',
        location: 'Phòng 103',
        status: 'maintenance',
        lastMaintenance: '2025-11-20',
        nextMaintenance: '2026-02-20'
    },
    {
        id: 'eq_004',
        name: 'Máy khoan nha khoa',
        code: 'DRILL-001',
        category: 'Thiết bị điều trị',
        location: 'Phòng 102',
        status: 'active',
        lastMaintenance: '2026-01-10',
        nextMaintenance: '2026-04-10'
    },
    {
        id: 'eq_005',
        name: 'Máy trộn amalgam',
        code: 'AMALG-001',
        category: 'Thiết bị hỗ trợ',
        location: 'Phòng vật tư',
        status: 'active',
        lastMaintenance: '2025-12-01',
        nextMaintenance: '2026-06-01'
    },
    {
        id: 'eq_006',
        name: 'Tủ tiệt trùng',
        code: 'STER-001',
        category: 'Vệ sinh khử trùng',
        location: 'Phòng khử trùng',
        status: 'active',
        lastMaintenance: '2026-01-01',
        nextMaintenance: '2026-04-01'
    },
    {
        id: 'eq_007',
        name: 'Máy hút bụi nha khoa',
        code: 'SUCTION-001',
        category: 'Thiết bị hỗ trợ',
        location: 'Phòng 101',
        status: 'maintenance',
        lastMaintenance: '2025-10-15',
        nextMaintenance: '2026-01-15'
    },
    {
        id: 'eq_008',
        name: 'Máy tẩy trắng răng Laser',
        code: 'LASER-001',
        category: 'Thẩm mỹ',
        location: 'Phòng 104',
        status: 'active',
        lastMaintenance: '2025-12-20',
        nextMaintenance: '2026-03-20'
    }
];

const ReceptionistEquipment = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);

    const filteredEquipment = mockEquipment.filter(eq => {
        const matchesSearch = eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            eq.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            eq.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || eq.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusInfo = (status) => {
        switch (status) {
            case 'active':
                return { variant: 'success', label: 'Hoạt động', icon: CheckCircle };
            case 'maintenance':
                return { variant: 'warning', label: 'Bảo trì', icon: AlertCircle };
            default:
                return { variant: 'default', label: status, icon: Wrench };
        }
    };

    const handleUpdateClick = (equipment) => {
        setSelectedEquipment(equipment);
        setShowUpdateModal(true);
    };

    const closeModal = () => {
        setShowUpdateModal(false);
        setSelectedEquipment(null);
    };

    const handleUpdateMaintenance = (equipmentId, data) => {
        // TODO: Call API to update maintenance
        console.log('Updating equipment maintenance:', equipmentId, data);
    };

    const activeCount = mockEquipment.filter(eq => eq.status === 'active').length;
    const maintenanceCount = mockEquipment.filter(eq => eq.status === 'maintenance').length;

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Quản Lý Thiết Bị</h1>
                <p className="text-gray-600 mt-1">Theo dõi thiết bị và lịch bảo trì</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Tổng thiết bị</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{mockEquipment.length}</p>
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
                            <p className="text-sm text-gray-600">Đang bảo trì</p>
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
                            placeholder="Tìm kiếm thiết bị, mã thiết bị, vị trí..."
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
                        <option value="active">Đang hoạt động</option>
                        <option value="maintenance">Đang bảo trì</option>
                    </select>
                </div>
            </Card>

            {/* Equipment Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thiết bị</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã TB</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Danh mục</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vị trí</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bảo trì cuối</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bảo trì tiếp</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredEquipment.map((equipment) => {
                                const statusInfo = getStatusInfo(equipment.status);
                                const StatusIcon = statusInfo.icon;

                                return (
                                    <tr key={equipment.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="p-2 bg-gray-100 rounded-lg mr-3">
                                                    <Wrench size={20} className="text-gray-600" />
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">{equipment.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-600">{equipment.code}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900">{equipment.category}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-600">{equipment.location}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-600">{equipment.lastMaintenance}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-600">{equipment.nextMaintenance}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <Badge variant={statusInfo.variant}>
                                                <StatusIcon size={14} className="inline mr-1" />
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
            </Card>

            {/* Update Maintenance Modal */}
            <UpdateMaintenanceModal
                equipment={selectedEquipment}
                isOpen={showUpdateModal}
                onClose={closeModal}
                onUpdate={handleUpdateMaintenance}
            />
        </div>
    );
};

export default ReceptionistEquipment;
