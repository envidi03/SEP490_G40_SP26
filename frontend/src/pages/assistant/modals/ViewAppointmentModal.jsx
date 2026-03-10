import { X, Eye, Phone, Mail, Calendar, Clock, CheckCircle } from 'lucide-react';
import { formatDate } from '../../../utils/dateUtils';

const ViewAppointmentModal = ({ appointment, isOpen, onClose }) => {
    if (!isOpen || !appointment) return null;

    const getStatusLabel = (status) => {
        switch (status) {
            case 'SCHEDULED': return { label: 'Chờ khám', className: 'bg-yellow-100 text-yellow-700' };
            case 'CHECKED_IN': return { label: 'Đã đến', className: 'bg-green-100 text-green-700' };
            case 'IN_CONSULTATION': return { label: 'Đang khám', className: 'bg-blue-100 text-blue-700' };
            case 'COMPLETED': return { label: 'Hoàn thành', className: 'bg-indigo-100 text-indigo-700' };
            case 'CANCELLED': return { label: 'Đã hủy', className: 'bg-red-100 text-red-700' };
            case 'NO_SHOW': return { label: 'Không đến', className: 'bg-red-100 text-red-700' };
            default: return { label: status, className: 'bg-gray-100 text-gray-700' };
        }
    };

    const statusInfo = getStatusLabel(appointment.status);

    return (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-2xl w-full mx-4 border border-gray-200 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Eye className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Chi Tiết Lịch Hẹn</h2>
                            <p className="text-sm text-gray-500">Thông tin cuộc hẹn</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Appointment Info */}
                <div className="space-y-6">
                    {/* Time & Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <div className="flex items-center gap-2 text-blue-700 mb-1">
                                <Calendar size={16} />
                                <span className="text-sm font-medium">Ngày khám</span>
                            </div>
                            <p className="text-lg font-bold text-blue-900">
                                {formatDate(appointment.appointment_date)}
                            </p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                            <div className="flex items-center gap-2 text-purple-700 mb-1">
                                <Clock size={16} />
                                <span className="text-sm font-medium">Giờ khám</span>
                            </div>
                            <p className="text-lg font-bold text-purple-900">{appointment.appointment_time}</p>
                        </div>
                    </div>

                    {/* Patient Information */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <div className="w-1.5 h-5 bg-primary-500 rounded-full"></div>
                            Thông Tin Bệnh Nhân
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Họ và tên</span>
                                <span className="font-semibold text-gray-900">{appointment.full_name}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500 flex items-center gap-2">
                                    Số điện thoại
                                </span>
                                <div className="flex items-center gap-1.5 text-gray-900">
                                    <Phone size={14} className="text-gray-400" />
                                    <span className="font-medium">{appointment.phone}</span>
                                </div>
                            </div>
                            {appointment.email && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500 flex items-center gap-2">
                                        Email
                                    </span>
                                    <div className="flex items-center gap-1.5 text-gray-900">
                                        <Mail size={14} className="text-gray-400" />
                                        <span className="font-medium">{appointment.email}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Doctor & Services */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <div className="w-1.5 h-5 bg-green-500 rounded-full"></div>
                            Chi Tiết Dịch Vụ
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">Bác sĩ phụ trách</span>
                                <span className="font-medium text-gray-900">
                                    {appointment.doctor_info?.profile?.full_name || 'Chưa chỉ định'}
                                </span>
                            </div>

                            <div className="border-t border-gray-200 pt-3">
                                <span className="text-sm text-gray-500 block mb-2">Dịch vụ sẽ thực hiện:</span>
                                {appointment.book_service && appointment.book_service.length > 0 ? (
                                    <ul className="space-y-2">
                                        {appointment.book_service.map((service, index) => (
                                            <li key={index} className="flex items-center gap-2 text-sm text-gray-800 bg-white p-2 rounded border border-gray-200 shadow-sm">
                                                <CheckCircle size={14} className="text-green-500" />
                                                <span className="font-medium">{service.service_name || 'Khám chung'}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <span className="text-sm font-medium text-gray-900 bg-white p-2 rounded border border-gray-200 block shadow-sm">
                                        Khám chung
                                    </span>
                                )}
                            </div>

                            <div className="flex items-start justify-between border-t border-gray-200 pt-3">
                                <span className="text-sm text-gray-500">Ghi chú / Lý do</span>
                                <span className="font-medium text-gray-900 text-right max-w-[60%]">
                                    {appointment.reason || 'Không có ghi chú'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                                <span className="text-sm text-gray-500">Trạng thái</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusInfo.className}`}>
                                    {statusInfo.label}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-4 border-t flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        Đóng cửa sổ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewAppointmentModal;
