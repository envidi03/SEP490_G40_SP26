import React, { useState } from 'react';
import { ClipboardList, Calendar, Clock, FileText, DollarSign } from 'lucide-react';

const BookingFormStep = ({ bookingData, onSubmit }) => {
    const [reason, setReason] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (reason.trim()) {
            onSubmit(reason, notes);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

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
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Xác nhận thông tin</h2>

            {/* Booking Summary */}
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-xl p-6 mb-6">
                <h3 className="font-semibold text-primary-900 mb-4 text-lg">Thông tin đặt lịch</h3>

                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <FileText size={20} className="text-primary-600 mt-0.5" />
                        <div>
                            <div className="text-sm text-gray-600">Dịch vụ</div>
                            <div className="font-medium text-gray-900">{bookingData.service_name}</div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Calendar size={20} className="text-primary-600 mt-0.5" />
                        <div>
                            <div className="text-sm text-gray-600">Ngày khám</div>
                            <div className="font-medium text-gray-900">{formatDate(bookingData.date)}</div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Clock size={20} className="text-primary-600 mt-0.5" />
                        <div>
                            <div className="text-sm text-gray-600">Giờ khám</div>
                            <div className="font-medium text-gray-900">{bookingData.time}</div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <DollarSign size={20} className="text-primary-600 mt-0.5" />
                        <div>
                            <div className="text-sm text-gray-600">Chi phí dự kiến</div>
                            <div className="font-medium text-primary-600 text-lg">
                                {formatCurrency(bookingData.service_price)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Reason */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <ClipboardList size={18} className="text-primary-600" />
                        Lý do khám <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Vui lòng mô tả triệu chứng hoặc lý do khám..."
                        rows={4}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                        Vui lòng mô tả chi tiết để bác sĩ có thể chuẩn bị tốt hơn
                    </p>
                </div>

                {/* Notes (Optional) */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <ClipboardList size={18} className="text-gray-400" />
                        Ghi chú thêm (không bắt buộc)
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Thông tin bổ sung (tiền sử bệnh, dị ứng thuốc, ...)"
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={!reason.trim()}
                    className="w-full px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-lg"
                >
                    Xác nhận đặt lịch
                </button>

                <p className="text-center text-sm text-gray-500">
                    Sau khi đặt lịch, chúng tôi sẽ liên hệ xác nhận trong vòng 24h
                </p>
            </form>
        </div>
    );
};

export default BookingFormStep;
