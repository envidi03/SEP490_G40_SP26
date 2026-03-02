import React from 'react';
import { Calendar, Activity, Eye, History, Edit } from 'lucide-react';

const EquipmentCard = ({
    equipment,
    usageCount,
    onViewDetails,
    onViewUsage,
    onEdit,
    getStatusColor,
    getStatusText,
    formatDate
}) => {
    const equipId = equipment._id || equipment.id;

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
            {/* Header */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <p className="text-xs text-blue-100 mb-1">{equipment.equipment_type}</p>
                        <h3 className="text-xl font-bold mb-2">
                            {equipment.equipment_name}
                        </h3>
                    </div>
                </div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(equipment.status)} bg-white`}>
                    {getStatusText(equipment.status)}
                </span>
            </div>

            {/* Body */}
            <div className="p-6 space-y-3">
                {/* Serial Number */}
                {equipment.equipment_serial_number && (
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Số serial</p>
                        <p className="text-sm font-mono font-semibold text-gray-900">
                            {equipment.equipment_serial_number}
                        </p>
                    </div>
                )}

                {/* Supplier */}
                {equipment.supplier && (
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Nhà cung cấp</p>
                        <p className="text-sm font-semibold text-gray-900">
                            {equipment.supplier}
                        </p>
                    </div>
                )}

                {/* Purchase Date */}
                {equipment.purchase_date && (
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Ngày mua</p>
                        <p className="text-sm font-semibold text-gray-900">
                            {formatDate(equipment.purchase_date)}
                        </p>
                    </div>
                )}

                {/* Warranty */}
                {equipment.warranty && (
                    <div className="p-3 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-2 mb-1">
                            <Calendar size={14} className="text-gray-600" />
                            <p className="text-xs font-semibold text-gray-700">Hạn bảo hành</p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                            {formatDate(equipment.warranty)}
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
                        onClick={() => onViewDetails(equipment)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                    >
                        <Eye size={16} />
                        <span>Chi tiết</span>
                    </button>
                    <button
                        onClick={() => onViewUsage(equipment)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
                    >
                        <History size={16} />
                        <span>Lịch sử</span>
                    </button>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit(equipment)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors text-sm font-medium"
                    >
                        <Edit size={16} />
                        <span>Sửa</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EquipmentCard;
