import React from 'react';
import { PackageX } from 'lucide-react';
import EquipmentCard from './EquipmentCard';

const EquipmentGrid = ({
    filteredEquipment,
    loading,
    equipmentUsage,
    onViewDetails,
    onViewUsage,
    onEdit,
    onDelete,
    getStatusColor,
    getStatusText,
    formatDate,
    searchTerm,
    statusFilter
}) => {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (filteredEquipment.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <PackageX size={64} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Không tìm thấy thiết bị
                </h3>
                <p className="text-gray-600">
                    {searchTerm || statusFilter !== 'all'
                        ? 'Không có thiết bị nào phù hợp với bộ lọc của bạn'
                        : 'Chưa có thiết bị nào trong hệ thống'}
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEquipment.map(equip => {
                const equipId = equip._id || equip.id;
                const usageCount = equipmentUsage.filter(u => u.equipment_id === equipId).length;

                return (
                    <EquipmentCard
                        key={equipId}
                        equipment={equip}
                        usageCount={usageCount}
                        onViewDetails={onViewDetails}
                        onViewUsage={onViewUsage}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        getStatusColor={getStatusColor}
                        getStatusText={getStatusText}
                        formatDate={formatDate}
                    />
                );
            })}
        </div>
    );
};

export default EquipmentGrid;
