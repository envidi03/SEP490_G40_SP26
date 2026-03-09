import { X, Eye, Phone, Mail, Calendar, Clock } from 'lucide-react';

const ViewAppointmentModal = ({ appointment, isOpen, onClose }) => {
    if (!isOpen || !appointment) return null;

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
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                {/* Appointment Info */}
                <div className="space-y-6">
                    {/* Time & Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-2 text-blue-700 mb-1">
                                <Calendar size={16} />
                                <span className="text-sm font-medium">Ngày khám</span>
                            </div>
                            <p className="text-lg font-bold text-blue-900">{appointment.date}</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg">
                            <div className="flex items-center gap-2 text-purple-700 mb-1">
                                <Clock size={16} />
                                <span className="text-sm font-medium">Giờ khám</span>
                            </div>
                            <p className="text-lg font-bold text-purple-900">{appointment.time}</p>
                        </div>
                    </div>

                    {/* Patient Information */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <div className="w-1 h-5 bg-primary-600 rounded"></div>
                            Thông Tin Bệnh Nhân
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Họ và tên</span>
                                <span className="font-medium text-gray-900">{appointment.patientName}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 flex items-center gap-2">
                                    <Phone size={14} />
                                    Số điện thoại
                                </span>
                                <span className="font-medium text-gray-900">{appointment.patientPhone}</span>
                            </div>
                        </div>
                    </div>

                    {/* Doctor & Reason */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <div className="w-1 h-5 bg-green-600 rounded"></div>
                            Chi Tiết Khám
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Bác sĩ phụ trách</span>
                                <span className="font-medium text-gray-900">{appointment.doctorName}</span>
                            </div>
                            <div className="flex items-start justify-between">
                                <span className="text-sm text-gray-600">Lý do khám</span>
                                <span className="font-medium text-gray-900 text-right">{appointment.reason}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Trạng thái</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${appointment.status === 'confirmed'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {appointment.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xác nhận'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Preparation Status */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <div className="w-1 h-5 bg-orange-600 rounded"></div>
                            Trạng Thái Chuẩn Bị
                        </h3>
                        <div className="bg-orange-50 p-4 rounded-lg">
                            <p className="text-sm text-orange-900">
                                {appointment.preparationStatus === 'prepared' && '✅ Đã chuẩn bị đầy đủ'}
                                {appointment.preparationStatus === 'in_progress' && '🔄 Đang trong quá trình chuẩn bị'}
                                {appointment.preparationStatus === 'not_prepared' && '❌ Chưa chuẩn bị'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-4 border-t flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewAppointmentModal;
