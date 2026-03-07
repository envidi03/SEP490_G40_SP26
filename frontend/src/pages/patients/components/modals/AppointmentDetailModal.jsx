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

    const appointmentDate = appointment.appointment_date || appointment.date;
    const appointmentTime = appointment.appointment_time || appointment.time;

    let isPast = false;
    if (appointmentDate && appointmentTime) {
        try {
            const aptDate = new Date(appointmentDate);
            let hours = 0, minutes = 0;
            if (typeof appointmentTime === 'string' && appointmentTime.includes(':')) {
                const parts = appointmentTime.split(':');
                hours = parseInt(parts[0], 10);
                minutes = parseInt(parts[1], 10);
            }
            const aptDateTime = new Date(aptDate.getFullYear(), aptDate.getMonth(), aptDate.getDate(), hours, minutes);
            isPast = aptDateTime < new Date();
        } catch (e) {
            console.error(e);
        }
    }

    const isUpdatable = appointment.status === 'SCHEDULED' && !isPast;
    const isCancelable = appointment.status === 'SCHEDULED' && !isPast;

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
                                <div className="font-semibold">{appointment.doctor_name || appointment.doctorName || 'Đang chờ phân công'}</div>
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
                                    {appointment.appointment_date
                                        ? new Date(appointment.appointment_date).toLocaleDateString('vi-VN', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })
                                        : new Date(appointment.date).toLocaleDateString('vi-VN', {
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
                                <div className="font-semibold">{appointment.appointment_time || appointment.time}</div>
                            </div>
                        </div>

                        {/* Patient Name */}
                        <div className="flex items-center gap-3 text-gray-700">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                <User size={20} className="text-primary-600" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">Bệnh nhân</div>
                                <div className="font-semibold">{appointment.full_name || appointment.patientName}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-4">
                    {/* Phone */}
                    <div className="border-l-4 border-primary-500 pl-4">
                        <div className="text-sm text-gray-500 mb-1">Số điện thoại</div>
                        <div className="font-medium text-gray-900">{appointment.phone || appointment.patientPhone}</div>
                    </div>

                    {/* Email (Nếu có) */}
                    {appointment.email && (
                        <div className="border-l-4 border-purple-500 pl-4">
                            <div className="text-sm text-gray-500 mb-1">Email</div>
                            <div className="font-medium text-gray-900">{appointment.email}</div>
                        </div>
                    )}

                    {/* Notes */}
                    {(appointment.note || appointment.notes) && (
                        <div className="border-l-4 border-blue-500 pl-4">
                            <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                                <FileText size={14} />
                                Ghi chú
                            </div>
                            <div className="text-gray-900">{appointment.note || appointment.notes}</div>
                        </div>
                    )}

                    {/* Dịch vụ (Nếu có) */}
                    {appointment.book_service && appointment.book_service.length > 0 && (
                        <div className="border-l-4 border-teal-500 pl-4">
                            <div className="text-sm text-gray-500 mb-1">Dịch vụ đã đặt</div>
                            <div className="space-y-2">
                                {appointment.book_service.map((serviceItem, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                        <span className="font-medium text-gray-800">
                                            {serviceItem.service_id?.service_name || 'Dịch vụ'}
                                        </span>
                                        <span className="text-primary-600 font-semibold">
                                            {serviceItem.unit_price?.toLocaleString('vi-VN')} VNĐ
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Created Date */}
                    {appointment.createdAt && (
                        <div className="border-l-4 border-gray-300 pl-4">
                            <div className="text-sm text-gray-500 mb-1">Ngày đặt lịch</div>
                            <div className="text-gray-900">
                                {new Date(appointment.createdAt).toLocaleDateString('vi-VN')} lúc {new Date(appointment.createdAt).toLocaleTimeString('vi-VN')}
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                    {isUpdatable && (
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

                    {isCancelable && (
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
        _id: PropTypes.string,
        id: PropTypes.number,
        code: PropTypes.string,
        status: PropTypes.string,
        reason: PropTypes.string,
        doctor_name: PropTypes.string,
        doctorName: PropTypes.string,
        appointment_date: PropTypes.string,
        date: PropTypes.string,
        appointment_time: PropTypes.string,
        time: PropTypes.string,
        full_name: PropTypes.string,
        patientName: PropTypes.string,
        phone: PropTypes.string,
        patientPhone: PropTypes.string,
        email: PropTypes.string,
        note: PropTypes.string,
        notes: PropTypes.string,
        createdAt: PropTypes.string,
        book_service: PropTypes.arrayOf(PropTypes.object)
    }),
    onUpdate: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    getStatusColor: PropTypes.func.isRequired,
    getStatusText: PropTypes.func.isRequired,
};

export default AppointmentDetailModal;
