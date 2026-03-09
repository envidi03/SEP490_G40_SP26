import { X, Phone, Mail, MessageSquare } from 'lucide-react';

const ContactPatientModal = ({ appointment, isOpen, onClose }) => {
    if (!isOpen || !appointment) return null;

    const handleCall = () => {
        console.log('Calling:', appointment.phone);
        // TODO: Integrate with phone system
        window.location.href = `tel:${appointment.phone}`;
    };

    const handleSMS = () => {
        console.log('Sending SMS to:', appointment.phone);
        // TODO: Integrate with SMS service
        window.location.href = `sms:${appointment.phone}`;
    };

    const handleEmail = () => {
        console.log('Sending email');
        // TODO: Integrate with email service
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Liên Hệ Bệnh Nhân</h2>
                        <p className="text-sm text-gray-500 mt-1">Chọn phương thức liên lạc</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="font-medium text-gray-900">{appointment.full_name}</p>
                    <p className="text-sm text-gray-600 mt-1">
                        <Phone size={14} className="inline mr-1" />
                        {appointment.phone}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                        Lịch hẹn: {new Date(appointment.appointment_date).toLocaleDateString('vi-VN')} - {appointment.appointment_time}
                    </p>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={handleCall}
                        className="w-full flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
                    >
                        <div className="p-2 bg-green-100 group-hover:bg-green-200 rounded-lg">
                            <Phone className="text-green-600" size={20} />
                        </div>
                        <div className="text-left flex-1">
                            <p className="font-medium text-gray-900">Gọi điện</p>
                            <p className="text-sm text-gray-600">{appointment.phone}</p>
                        </div>
                    </button>

                    <button
                        onClick={handleSMS}
                        className="w-full flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
                    >
                        <div className="p-2 bg-blue-100 group-hover:bg-blue-200 rounded-lg">
                            <MessageSquare className="text-blue-600" size={20} />
                        </div>
                        <div className="text-left flex-1">
                            <p className="font-medium text-gray-900">Gửi tin nhắn SMS</p>
                            <p className="text-sm text-gray-600">Nhắc lịch hẹn</p>
                        </div>
                    </button>

                    <button
                        onClick={handleEmail}
                        className="w-full flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group"
                    >
                        <div className="p-2 bg-purple-100 group-hover:bg-purple-200 rounded-lg">
                            <Mail className="text-purple-600" size={20} />
                        </div>
                        <div className="text-left flex-1">
                            <p className="font-medium text-gray-900">Gửi Email</p>
                            <p className="text-sm text-gray-600">Thông tin chi tiết lịch hẹn</p>
                        </div>
                    </button>
                </div>

                <div className="mt-6 pt-4 border-t">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContactPatientModal;
