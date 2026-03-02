import React from 'react';
import PropTypes from 'prop-types';
import { Calendar, Clock, User, FileText, Edit, X as XIcon } from 'lucide-react';

/**
 * AppointmentCard - Component hiển thị thông tin một lịch khám dạng card
 * Bao gồm thông tin cơ bản và các action buttons
 * 
 * @param {Object} appointment - Thông tin lịch khám
 * @param {function} onViewDetail - Callback khi click xem chi tiết
 * @param {function} onUpdate - Callback khi click cập nhật
 * @param {function} onCancel - Callback khi click hủy lịch
 * @param {function} getStatusColor - Function lấy màu theo status
 * @param {function} getStatusText - Function lấy text tiếng Việt theo status
 */
const AppointmentCard = ({
    appointment,
    onViewDetail,
    onUpdate,
    onCancel,
    getStatusColor,
    getStatusText
}) => {
    return (
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Left: Appointment Info */}
                <div className="flex-1">
                    <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Calendar size={24} className="text-primary-600" />
                        </div>

                        {/* Details */}
                        <div className="flex-1">
                            {/* Title & Status */}
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {appointment.reason}
                                </h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                                    {getStatusText(appointment.status)}
                                </span>
                            </div>

                            {/* Info Details */}
                            <div className="space-y-1 text-sm text-gray-600">
                                {/* Doctor */}
                                <div className="flex items-center gap-2">
                                    <User size={16} />
                                    <span className="font-medium">Bác sĩ:</span>
                                    <span>{appointment.doctorName}</span>
                                </div>

                                {/* Date */}
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} />
                                    <span className="font-medium">Ngày:</span>
                                    <span>{new Date(appointment.date).toLocaleDateString('vi-VN')}</span>
                                </div>

                                {/* Time */}
                                <div className="flex items-center gap-2">
                                    <Clock size={16} />
                                    <span className="font-medium">Giờ:</span>
                                    <span>{appointment.time}</span>
                                </div>

                                {/* Notes */}
                                {appointment.notes && (
                                    <div className="flex items-start gap-2 mt-2">
                                        <FileText size={16} className="mt-0.5" />
                                        <span className="font-medium">Ghi chú:</span>
                                        <span className="italic">{appointment.notes}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Action Buttons */}
                <div className="flex flex-wrap gap-2">
                    {/* Detail Button */}
                    <button
                        onClick={() => onViewDetail(appointment)}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                    >
                        Chi tiết
                    </button>

                    {/* Update Button - Only for Pending/Confirmed */}
                    {(appointment.status === 'Pending' || appointment.status === 'Confirmed') && (
                        <button
                            onClick={() => onUpdate(appointment)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-1"
                        >
                            <Edit size={16} />
                            Cập nhật
                        </button>
                    )}

                    {/* Cancel Button - Only for Pending */}
                    {appointment.status === 'Pending' && (
                        <button
                            onClick={() => onCancel(appointment)}
                            className="px-4 py-2 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium flex items-center gap-1"
                        >
                            <XIcon size={16} />
                            Hủy lịch
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

AppointmentCard.propTypes = {
    appointment: PropTypes.shape({
        id: PropTypes.number.isRequired,
        reason: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        doctorName: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
        time: PropTypes.string.isRequired,
        notes: PropTypes.string,
    }).isRequired,
    onViewDetail: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    getStatusColor: PropTypes.func.isRequired,
    getStatusText: PropTypes.func.isRequired,
};

export default AppointmentCard;
