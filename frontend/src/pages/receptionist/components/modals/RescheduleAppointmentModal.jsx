import { X, Calendar as CalendarIcon, Clock, AlertTriangle } from 'lucide-react';

const RescheduleAppointmentModal = ({ appointment, isOpen, onClose, onReschedule }) => {
    if (!isOpen || !appointment) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            newDate: formData.get('date'),
            newTime: formData.get('time'),
            reason: formData.get('reason')
        };
        // TODO: Call API to reschedule
        console.log('Rescheduling appointment:', data);
        if (onReschedule) {
            onReschedule(appointment.id, data);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Đổi Lịch Hẹn</h2>
                        <p className="text-sm text-gray-500 mt-1">Thay đổi ngày giờ khám</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-gray-700">
                        <span className="font-medium">Bệnh nhân:</span> {appointment.patientName}
                    </p>
                    <p className="text-sm text-gray-600">
                        Lịch cũ: {appointment.date} - {appointment.time}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                <CalendarIcon size={14} className="mr-1" />
                                Ngày mới
                            </label>
                            <input
                                type="date"
                                name="date"
                                required
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                <Clock size={14} className="mr-1" />
                                Giờ mới
                            </label>
                            <input
                                type="time"
                                name="time"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                            Lý do đổi lịch
                        </label>
                        <textarea
                            name="reason"
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            placeholder="Nhập lý do..."
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
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
