import React from 'react';
import { Eye, Edit2 } from 'lucide-react';

const RoomCard = ({
    room,
    getStatusIcon,
    getStatusColor,
    getStatusText,
    onViewDetail,
    onEdit
}) => {
    const StatusIcon = getStatusIcon(room.status);

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-bold">{room.room_number}</h3>
                    <StatusIcon size={24} />
                </div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(room.status)} bg-white`}>
                    {getStatusText(room.status)}
                </span>
            </div>

            {/* Body */}
            <div className="p-6">
                {room.note && (
                    <p className="text-sm text-gray-500 italic mb-4 line-clamp-2">{room.note}</p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-gray-200">
                    <button
                        onClick={() => onViewDetail(room)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 font-medium rounded-xl hover:bg-blue-100 transition-all duration-200"
                        title="Xem chi tiết"
                    >
                        <Eye size={16} />
                    </button>
                    <button
                        onClick={() => onEdit(room)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-600 font-medium rounded-xl hover:bg-green-100 transition-all duration-200"
                    >
                        <Edit2 size={16} />
                        <span>Sửa</span>
                    </button>

                </div>
            </div>
        </div>
    );
};

export default RoomCard;
