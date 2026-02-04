import { X, CheckCircle } from 'lucide-react';

const ConfirmAppointmentModal = ({ appointment, isOpen, onClose, onConfirm }) => {
    if (!isOpen || !appointment) return null;

    const handleConfirm = () => {
        // TODO: Call API to confirm appointment
        console.log('Confirming appointment:', appointment.id);
        if (onConfirm) {
            onConfirm(appointment.id);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="text-green-600" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Xác Nhận Lịch Hẹn</h2>
                            <p className="text-sm text-gray-500">Xác nhận cuộc hẹn này</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <p className="text-gray-600">Bệnh nhân</p>
                            <p className="font-medium text-gray-900">{appointment.patientName}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Số điện thoại</p>
                            <p className="font-medium text-gray-900">{appointment.patientPhone}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Ngày khám</p>
                            <p className="font-medium text-gray-900">{appointment.date}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Giờ khám</p>
                            <p className="font-medium text-gray-900">{appointment.time}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-gray-600">Bác sĩ</p>
                            <p className="font-medium text-gray-900">{appointment.doctorName}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-gray-600">Lý do khám</p>
                            <p className="font-medium text-gray-900">{appointment.reason}</p>
                        </div>
                    </div>
                </div>

                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                        <strong>Lưu ý:</strong> Bệnh nhân sẽ nhận được SMS/Email xác nhận sau khi bạn xác nhận lịch hẹn này.
                    </p>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                        <CheckCircle size={18} />
                        Xác nhận
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmAppointmentModal;
