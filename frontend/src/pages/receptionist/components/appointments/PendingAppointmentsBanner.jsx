import { ClipboardList, CheckCircle, XCircle, X } from 'lucide-react';

const PendingAppointmentsBanner = ({ 
    pendingAppointments, 
    showBanner, 
    onHide, 
    onConfirm, 
    onReject 
}) => {
    if (!showBanner || pendingAppointments.length === 0) return null;

    return (
        <div className="mb-6 bg-orange-50 border border-orange-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-orange-700 font-semibold">
                    <ClipboardList size={20} />
                    <span>🔔 Có {pendingAppointments.length} lịch hẹn đang chờ bạn xác nhận</span>
                </div>
                <button
                    onClick={onHide}
                    className="text-orange-400 hover:text-orange-600 transition-colors"
                    title="Ẩn banner"
                >
                    <X size={18} />
                </button>
            </div>
            <div className="space-y-2">
                {pendingAppointments.map(apt => (
                    <div
                        key={apt._id}
                        className="flex items-center justify-between bg-white border border-orange-100 rounded-xl px-4 py-3"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-100 text-orange-700 rounded-lg px-3 py-1.5 text-sm font-bold">
                                {apt.appointment_time}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">{apt.full_name}</p>
                                <p className="text-xs text-gray-500">
                                    {apt.phone} &nbsp;·&nbsp;
                                    {apt.appointment_date ? new Date(apt.appointment_date).toLocaleDateString('vi-VN') : ''}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onConfirm(apt._id, 'SCHEDULED')}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                <CheckCircle size={16} />
                                Xác nhận
                            </button>
                            <button
                                onClick={() => onReject(apt._id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                <XCircle size={16} />
                                Từ chối
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PendingAppointmentsBanner;
