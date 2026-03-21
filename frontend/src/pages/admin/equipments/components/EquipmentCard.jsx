import React from 'react';
import { Eye, History, Edit, Hash } from 'lucide-react';

const EquipmentCard = ({
    equipment,
    onViewDetails,
    onViewUsage,
    onEdit,
    getStatusColor,
    getStatusText
}) => {
    const equipId = equipment._id || equipment.id;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all flex flex-col justify-between h-full group">
            
            {/* --- Phần thông tin rút gọn --- */}
            <div className="mb-4">
                <div className="flex justify-between items-start gap-2">
                    <h3 className="text-base font-bold text-gray-800 line-clamp-2" title={equipment.equipment_name}>
                        {equipment.equipment_name}
                    </h3>
                    {/* Badge trạng thái thu nhỏ */}
                    <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(equipment.status)}`}>
                        {getStatusText(equipment.status)}
                    </span>
                </div>

                {/* Số Serial */}
                <div className="flex items-center text-gray-500 text-sm mt-2">
                    <Hash size={14} className="mr-1 text-gray-400" />
                    <span className="font-mono">{equipment.equipment_serial_number || 'Chưa có Serial'}</span>
                </div>
            </div>

            {/* --- Phần 3 Nút Action --- */}
            <div className="flex gap-2 mt-auto pt-3 border-t border-gray-100">
                <button
                    onClick={() => onViewDetails(equipment)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium"
                    title="Chi tiết"
                >
                    <Eye size={14} />
                    <span>Chi tiết</span>
                </button>
                
                <button
                    onClick={() => onViewUsage(equipment)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-xs font-medium"
                    title="Lịch sử"
                >
                    <History size={14} />
                    <span>Lịch sử</span>
                </button>
                
                <button
                    onClick={() => onEdit(equipment)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors text-xs font-medium"
                    title="Sửa"
                >
                    <Edit size={14} />
                    <span>Sửa</span>
                </button>
            </div>
            
        </div>
    );
};

export default EquipmentCard;