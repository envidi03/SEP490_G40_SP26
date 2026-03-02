import { X, XCircle } from 'lucide-react';

const CancelAppointmentModal = ({ appointment, isOpen, onClose, onConfirm }) => {
    if (!isOpen || !appointment) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const reason = formData.get('reason');
        // TODO: Call API to cancel appointment
        console.log('Cancelling appointment:', appointment.id, reason);
        if (onConfirm) {
            onConfirm(appointment.id, reason);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <XCircle className="text-red-600" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Hủy Lịch Hẹn</h2>
                            <p className="text-sm text-gray-500">Xác nhận hủy cuộc hẹn</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{appointment.patientName}</p>
                    <p className="text-sm text-gray-600 mt-1">
                        {appointment.date} - {appointment.time}
                    </p>
                    <p className="text-sm text-gray-600">Bác sĩ: {appointment.doctorName}</p>
                </div>

                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                        <strong>Lưu ý:</strong> Hành động này không thể hoàn tác. Bệnh nhân sẽ được thông báo qua SMS/Email.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                            Lý do hủy <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="reason"
                            required
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                            placeholder="Nhập lý do hủy lịch..."
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Đóng
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Xác nhận hủy
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CancelAppointmentModal;
