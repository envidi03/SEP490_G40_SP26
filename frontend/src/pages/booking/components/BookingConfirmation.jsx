import React from 'react';
import { CheckCircle, Calendar, FileText } from 'lucide-react';

const BookingConfirmation = ({ bookingData, onViewAppointments, onBookAnother }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="text-center py-8">
            {/* Success Icon */}
            <div className="mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={48} className="text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Đặt lịch thành công!</h2>
                <p className="text-gray-600 text-lg">
                    Cảm ơn bạn đã tin tưởng sử dụng dịch vụ của chúng tôi
                </p>
            </div>

            {/* Appointment Details */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6 mb-8 text-left max-w-md mx-auto">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText size={20} className="text-green-600" />
                    Thông tin lịch khám
                </h3>

                <div className="space-y-3">
                    <div>
                        <div className="text-sm text-gray-600">Dịch vụ & Gói khám</div>
                        <div className="font-medium text-gray-900">
                            {bookingData.service_name} - <span className="text-green-700 font-bold">{bookingData.sub_service_name}</span>
                        </div>
                    </div>

                    <div>
                        <div className="text-sm text-gray-600">Thời gian</div>
                        <div className="font-medium text-gray-900">
                            {formatDate(bookingData.date)} - {bookingData.time}
                        </div>
                    </div>

                    <div>
                        <div className="text-sm text-gray-600">Lý do khám</div>
                        <div className="font-medium text-gray-900">{bookingData.reason}</div>
                    </div>

                </div>
            </div>

            {/* Important Notes */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-left max-w-md mx-auto">
                <h4 className="font-semibold text-blue-900 mb-2">📋 Lưu ý quan trọng</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Chúng tôi sẽ gọi điện xác nhận lịch khám trong vòng 24h</li>
                    <li>• Vui lòng đến sớm 15 phút để làm thủ tục</li>
                    <li>• Mang theo CMND/CCCD và sổ khám bệnh (nếu có)</li>
                    <li>• Liên hệ hotline nếu cần thay đổi lịch hẹn</li>
                </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 max-w-md mx-auto">
                <button
                    onClick={onViewAppointments}
                    className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                >
                    <Calendar size={20} />
                    Xem danh sách lịch khám
                </button>

                <button
                    onClick={onBookAnother}
                    className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                    Đặt lịch khám khác
                </button>
            </div>
        </div>
    );
};

export default BookingConfirmation;
