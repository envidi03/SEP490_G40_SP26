import { X, Calendar, Clock, Phone, Mail, User, Tag, Hash, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import appointmentService from '../../../../services/appointmentService';
import Badge from '../../../../components/ui/Badge';

const ViewAppointmentDetailsModal = ({ appointmentId, isOpen, onClose }) => {
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && appointmentId) {
            fetchDetails();
        }
    }, [isOpen, appointmentId]);

    const fetchDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await appointmentService.getAppointmentById(appointmentId);
            const data = response?.data?.data || response?.data || response;
            setAppointment(data);
        } catch (err) {
            console.error('Error fetching appointment details:', err);
            setError('Không thể tải chi tiết lịch hẹn. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const getStatusInfo = (status) => {
        switch (status) {
            case 'SCHEDULED': return { variant: 'warning', label: 'Chờ khám' };
            case 'CHECKED_IN': return { variant: 'success', label: 'Đã đến' };
            case 'IN_CONSULTATION': return { variant: 'success', label: 'Đang khám' };
            case 'COMPLETED': return { variant: 'primary', label: 'Hoàn thành' };
            case 'CANCELLED': return { variant: 'danger', label: 'Đã hủy' };
            case 'NO_SHOW': return { variant: 'danger', label: 'Không đến' };
            default: return { variant: 'default', label: status };
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '—';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-blue-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-100 rounded-xl">
                            <Calendar className="text-primary-600" size={22} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Chi Tiết Lịch Hẹn</h2>
                            <p className="text-xs text-gray-500">Thông tin đầy đủ cuộc hẹn</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {loading && (
                        <div className="text-center py-16">
                            <Loader2 size={36} className="mx-auto text-primary-500 animate-spin mb-3" />
                            <p className="text-gray-500 text-sm">Đang tải thông tin...</p>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                            <AlertCircle size={20} className="flex-shrink-0" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {appointment && !loading && (
                        <div className="space-y-5">
                            {/* Status + Queue Number */}
                            <div className="flex items-center gap-3 flex-wrap">
                                {(() => { const s = getStatusInfo(appointment.status); return <Badge variant={s.variant}>{s.label}</Badge>; })()}
                                {appointment.queue_number && (
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full">
                                        <Hash size={14} className="text-amber-600" />
                                        <span className="text-sm font-semibold text-amber-700">STT: {appointment.queue_number}</span>
                                    </div>
                                )}
                            </div>

                            {/* Patient Info */}
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Thông Tin Bệnh Nhân</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-start gap-2">
                                        <User size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-500">Họ và tên</p>
                                            <p className="text-sm font-semibold text-gray-900">{appointment.full_name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Phone size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-500">Số điện thoại</p>
                                            <p className="text-sm font-semibold text-gray-900">{appointment.phone}</p>
                                        </div>
                                    </div>
                                    {appointment.email && (
                                        <div className="flex items-start gap-2 col-span-2">
                                            <Mail size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs text-gray-500">Email</p>
                                                <p className="text-sm font-semibold text-gray-900">{appointment.email}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Linked patient profile */}
                                {appointment.patient_id && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle size={14} className="text-green-500" />
                                            <span className="text-xs text-green-700 font-medium">Bệnh nhân đã có hồ sơ trong hệ thống</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Appointment Time */}
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Thời Gian Khám</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-start gap-2">
                                        <Calendar size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-500">Ngày hẹn</p>
                                            <p className="text-sm font-semibold text-gray-900">{formatDate(appointment.appointment_date)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Clock size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-500">Giờ hẹn</p>
                                            <p className="text-sm font-semibold text-gray-900">{appointment.appointment_time}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Reason */}
                            {appointment.reason && (
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Lý Do Khám</h3>
                                    <p className="text-sm text-gray-800">{appointment.reason}</p>
                                </div>
                            )}

                            {/* Booked Services */}
                            {appointment.book_service && appointment.book_service.length > 0 && (
                                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                        Dịch Vụ Đã Đặt ({appointment.book_service.length})
                                    </h3>
                                    <div className="space-y-2">
                                        {appointment.book_service.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center py-2 px-3 bg-white rounded-lg border border-green-200">
                                                <div className="flex items-center gap-2">
                                                    <Tag size={14} className="text-green-600" />
                                                    <span className="text-sm font-medium text-gray-800">
                                                        {item.service_id?.service_name || item.service_id?.name || `Dịch vụ #${index + 1}`}
                                                    </span>
                                                </div>
                                                <span className="text-sm font-semibold text-green-700">
                                                    {formatCurrency(item.unit_price)}
                                                </span>
                                            </div>
                                        ))}
                                        {/* Total */}
                                        <div className="flex justify-between items-center pt-2 border-t border-green-200">
                                            <span className="text-sm font-semibold text-gray-700">Tổng ước tính</span>
                                            <span className="text-sm font-bold text-primary-700">
                                                {formatCurrency(appointment.book_service.reduce((sum, item) => sum + (item.unit_price || 0), 0))}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Meta */}
                            <div className="text-xs text-gray-400 text-right">
                                ID: {appointment._id}
                                {appointment.createdAt && ` · Tạo lúc: ${new Date(appointment.createdAt).toLocaleString('vi-VN')}`}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewAppointmentDetailsModal;
