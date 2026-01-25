import React from 'react';
import { UserCog, Trash2, Eye, Edit2 } from 'lucide-react';
import { formatDate } from '../../../../utils/dateUtils';

const RoomCard = ({
    room,
    getStatusIcon,
    getStatusColor,
    getStatusText,
    getAssignedDoctors,
    onAssignDoctor,
    onRemoveAssignment,
    onViewDetail,
    onEdit,
    onDelete
}) => {
    const StatusIcon = getStatusIcon(room.status);
    const assignedDoctors = getAssignedDoctors(room.id);

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-bold">
                        {room.room_number}
                    </h3>
                    <StatusIcon size={24} />
                </div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(room.status)} bg-white`}>
                    {getStatusText(room.status)}
                </span>
            </div>

            {/* Body */}
            <div className="p-6">
                {/* Assigned Doctors */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <UserCog size={16} className="text-blue-600" />
                            Bác sĩ phụ trách
                        </h4>
                        <button
                            onClick={() => onAssignDoctor(room)}
                            className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                        >
                            + Gán
                        </button>
                    </div>
                    {assignedDoctors.length > 0 ? (
                        <div className="space-y-2">
                            {assignedDoctors.map((doctor, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between bg-blue-50 rounded-lg p-2"
                                >
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">
                                            {doctor.full_name}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            Từ: {formatDate(doctor.assignmentDate)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => onRemoveAssignment(room.id, doctor.id)}
                                        className="text-red-600 hover:text-red-700 p-1"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 italic">Chưa có bác sĩ</p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
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
                    <button
                        onClick={() => onDelete(room.id)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-all duration-200"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoomCard;
