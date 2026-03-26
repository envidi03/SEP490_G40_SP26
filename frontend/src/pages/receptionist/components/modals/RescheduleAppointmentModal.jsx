import { useState } from 'react';
import { X, Calendar as CalendarIcon, Clock, AlertTriangle } from 'lucide-react';

const RescheduleAppointmentModal = ({ appointment, isOpen, onClose, onReschedule }) => {
    const [errors, setErrors] = useState({});

    if (!isOpen || !appointment) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            appointment_date: formData.get('date'),
            appointment_time: formData.get('time'),
            reason: formData.get('reason')
        };

        // Manual Validation
        const newErrors = {};
        if (!data.appointment_date) newErrors.date = 'Vui lòng chọn ngày mới';
        if (!data.appointment_time) newErrors.time = 'Vui lòng chọn giờ mới';
        if (!data.reason || !data.reason.trim()) newErrors.reason = 'Vui lòng nhập lý do đổi lịch';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        // Call API to reschedule
        if (onReschedule) {
            onReschedule(appointment._id, data);
        }
        onClose();
    };

    const handleClose = () => {
        setErrors({});
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Đổi Lịch Hẹn</h2>
                        <p className="text-sm text-gray-500 mt-1">Thay đổi ngày giờ khám</p>
                    </div>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-gray-700">
                        <span className="font-medium">Bệnh nhân:</span> {appointment.full_name}
                    </p>
                    <p className="text-sm text-gray-600">
                        Lịch cũ: {new Date(appointment.appointment_date).toLocaleDateString('vi-VN')} - {appointment.appointment_time}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                <CalendarIcon size={14} className="mr-1" />
                                Ngày mới <span className="text-red-500 ml-0.5">*</span>
                            </label>
                            <input
                                type="date"
                                name="date"
                                min={new Date().toISOString().split('T')[0]}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all ${
                                    errors.date ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                }`}
                            />
                            {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
                        </div>
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                <Clock size={14} className="mr-1" />
                                Giờ mới <span className="text-red-500 ml-0.5">*</span>
                            </label>
                            <input
                                type="time"
                                name="time"
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all ${
                                    errors.time ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                }`}
                            />
                            {errors.time && <p className="text-xs text-red-500 mt-1">{errors.time}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                            Lý do đổi lịch <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="reason"
                            rows={3}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none ${
                                errors.reason ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                            placeholder="Nhập lý do đổi lịch..."
                        />
                        {errors.reason && <p className="text-xs text-red-500 mt-1">{errors.reason}</p>}
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm font-medium"
                        >
                            Xác nhận đổi lịch
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RescheduleAppointmentModal;
