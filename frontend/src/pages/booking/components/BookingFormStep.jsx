import React, { useState, useEffect } from 'react';
import { ClipboardList, Calendar, Clock, FileText, DollarSign, User, Phone, Mail } from 'lucide-react';

const BookingFormStep = ({ bookingData, onSubmit, user }) => {
    // Determine initial values safely
    const initialName = user?.profile?.full_name || user?.username || user?.full_name || '';
    const initialPhone = user?.profile?.phone_number || user?.phone_number || user?.phone || '';
    const initialEmail = user?.email || '';

    const [fullName, setFullName] = useState(initialName);
    const [phone, setPhone] = useState(initialPhone);
    const [email, setEmail] = useState(initialEmail);
    const [reason, setReason] = useState('');
    const [notes, setNotes] = useState('');

    // Pre-fill if user object loads asynchronously later
    useEffect(() => {
        if (user) {
            setFullName(user?.profile?.full_name || user?.username || user?.full_name || '');
            setPhone(user?.profile?.phone_number || user?.phone_number || user?.phone || '');
            setEmail(user?.email || '');
        }
    }, [user]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (reason.trim() && fullName.trim() && phone.trim()) {
            onSubmit({
                reason,
                notes,
                full_name: fullName.trim(),
                phone: phone.trim(),
                email: email.trim()
            });
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

                {/* User Info Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-gray-100 pb-6 mb-6">
                    <div className="md:col-span-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <User size={18} className="text-primary-600" />
                            Họ và Tên (Người khám) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Nhập họ tên người khám bệnh"
                            required
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <Phone size={18} className="text-primary-600" />
                            Số điện thoại <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Số điện thoại liên hệ"
                            required
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <Mail size={18} className="text-primary-600" />
                            Email <span className="text-gray-400 font-normal">(Không bắt buộc)</span>
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Email nhận thông báo"
                        />
                    </div>
                    <div className="md:col-span-2 mt-1">
                        <p className="text-sm text-gray-500 italic">
                            * Gợi ý: Thông tin trên đã được tự động điền sẵn từ tài khoản của bạn. Tuy nhiên, bạn hoàn toàn có thể thay đổi các thông tin này nếu đang **đặt lịch khám hộ** cho người thân (Con cái, Cha mẹ, Bạn bè).
                        </p>
                    </div>
                </div>

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
