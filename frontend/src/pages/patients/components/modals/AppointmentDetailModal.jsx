import React from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../../components/ui/Modal';
import Button from '../../../../components/ui/Button';
import { Calendar, Clock, User, FileText, Edit, X as XIcon } from 'lucide-react';

/**
 * AppointmentDetailModal - Modal hiển thị chi tiết đầy đủ thông tin lịch khám
 * Bao gồm thông tin bác sĩ, bệnh nhân, thời gian và các actions
 * 
 * @param {boolean} isOpen - Trạng thái hiển thị modal
 * @param {function} onClose - Callback khi đóng modal
 * @param {Object} appointment - Thông tin chi tiết lịch khám
 * @param {function} onUpdate - Callback khi click nút cập nhật
 * @param {function} onCancel - Callback khi click nút hủy
 * @param {function} getStatusColor - Function lấy màu theo status
 * @param {function} getStatusText - Function lấy text tiếng Việt theo status
 */
const AppointmentDetailModal = ({
    isOpen,
    onClose,
    appointment,
    onUpdate,
    onCancel,
    getStatusColor,
    getStatusText
}) => {
    if (!appointment) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Chi tiết lịch khám"
            size="lg"
        >
            <div className="space-y-6">
                {/* Status Badge & Code */}
                <div className="flex items-center justify-between">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                    </span>
                    <span className="text-sm text-gray-500">
                        Mã: {appointment.code}
                    </span>
                </div>

                {/* Main Info */}
                <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                        {appointment.reason}
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Doctor */}
                        <div className="flex items-center gap-3 text-gray-700">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                <User size={20} className="text-primary-600" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">Bác sĩ</div>
                                <div className="font-semibold">{appointment.doctorName}</div>
                            </div>
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-3 text-gray-700">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                <Calendar size={20} className="text-primary-600" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">Ngày khám</div>
                                <div className="font-semibold">
                                    {new Date(appointment.date).toLocaleDateString('vi-VN', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Time */}
                        <div className="flex items-center gap-3 text-gray-700">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                <Clock size={20} className="text-primary-600" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">Giờ khám</div>
                                <div className="font-semibold">{appointment.time}</div>
                            </div>
                        </div>

                        {/* Patient Name */}
                        <div className="flex items-center gap-3 text-gray-700">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                <User size={20} className="text-primary-600" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">Bệnh nhân</div>
                                <div className="font-semibold">{appointment.patientName}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-4">
                    {/* Phone */}
                    <div className="border-l-4 border-primary-500 pl-4">
                        <div className="text-sm text-gray-500 mb-1">Số điện thoại</div>
                        <div className="font-medium text-gray-900">{appointment.patientPhone}</div>
                    </div>

                    {/* Notes */}
                    {appointment.notes && (
                        <div className="border-l-4 border-blue-500 pl-4">
                            <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                                <FileText size={14} />
                                Ghi chú
                            </div>
                            <div className="text-gray-900">{appointment.notes}</div>
                        </div>
                    )}

                    {/* Created Date */}
                    <div className="border-l-4 border-gray-300 pl-4">
                        <div className="text-sm text-gray-500 mb-1">Ngày đặt lịch</div>
                        <div className="text-gray-900">
                            {new Date(appointment.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                    {(appointment.status === 'Pending' || appointment.status === 'Confirmed') && (
                        <Button
                            onClick={() => {
                                onClose();
                                onUpdate(appointment);
                            }}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                            <Edit size={18} className="inline mr-2" />
                            Cập nhật lịch
                        </Button>
                    )}

                    {appointment.status === 'Pending' && (
                        <Button
                            onClick={() => {
                                onClose();
                                onCancel(appointment);
                            }}
                            className="flex-1 bg-red-600 hover:bg-red-700"
                        >
                            <XIcon size={18} className="inline mr-2" />
                            Hủy lịch
                        </Button>
                    )}

                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </Modal>
    );
};

AppointmentDetailModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    appointment: PropTypes.shape({
        id: PropTypes.number,
        code: PropTypes.string,
        status: PropTypes.string,
        reason: PropTypes.string,
        doctorName: PropTypes.string,
        date: PropTypes.string,
        time: PropTypes.string,
        patientName: PropTypes.string,
        patientPhone: PropTypes.string,
        notes: PropTypes.string,
        createdAt: PropTypes.string,
    }),
    onUpdate: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    getStatusColor: PropTypes.func.isRequired,
    getStatusText: PropTypes.func.isRequired,
};

export default AppointmentDetailModal;
