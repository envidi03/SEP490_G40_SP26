import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, Clock, User, FileText, Search } from 'lucide-react';

const BookAppointmentModal = ({ isOpen, onClose, onBook }) => {
    const [formData, setFormData] = useState({
        phone: '',
        full_name: '',
        appointment_date: '',
        appointment_time: '',
        doctor_id: '',
        reason: '',
        notes: ''
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Call API to create appointment on behalf of patient
        if (onBook) {
            onBook(formData);
        }

        // Reset form
        setFormData({
            phone: '',
            full_name: '',
            appointment_date: '',
            appointment_time: '',
            doctor_id: '',
            reason: '',
            notes: ''
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Optional light backdrop or blur if needed, or completely remove background */}
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <CalendarIcon className="text-primary-600" />
                            Đặt Lịch Hẹn Mới
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Tạo lịch hẹn khám bệnh cho bệnh nhân</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-5">
                        {/* Patient Info Section */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                                Thông tin bệnh nhân
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        <Search size={16} className="mr-2 text-gray-400" />
                                        Số điện thoại <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        placeholder="0901234567"
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        <User size={16} className="mr-2 text-gray-400" />
                                        Họ và tên bệnh nhân <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                        placeholder="Nhập họ tên"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Date & Time */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                                Thời gian khám
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        <CalendarIcon size={16} className="mr-2 text-gray-400" />
                                        Ngày hẹn <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="appointment_date"
                                        value={formData.appointment_date}
                                        onChange={handleChange}
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                        <Clock size={16} className="mr-2 text-gray-400" />
                                        Giờ hẹn <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        name="appointment_time"
                                        value={formData.appointment_time}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Doctor Selection */}
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                <User size={16} className="mr-2 text-gray-400" />
                                Bác sĩ khám <span className="text-red-500 ml-1">*</span>
                            </label>
                            <select
                                name="doctor_id"
                                value={formData.doctor_id}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="">-- Chọn bác sĩ --</option>
                                <option value="dr_nguyen">BS. Nguyễn Văn Anh - Răng Hàm Mặt</option>
                                <option value="dr_tran">BS. Trần Thị Bình - Nha Khoa Thẩm Mỹ</option>
                                <option value="dr_le">BS. Lê Hoàng Cường - Chỉnh Nha</option>
                                <option value="dr_pham">BS. Phạm Minh Đức - Nhổ Răng</option>
                            </select>
                        </div>

                        {/* Reason for Visit */}
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                <FileText size={16} className="mr-2 text-gray-400" />
                                Lý do khám <span className="text-red-500 ml-1">*</span>
                            </label>
                            <textarea
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                required
                                rows={3}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                placeholder="Mô tả triệu chứng hoặc lý do đặt lịch..."
                            />
                        </div>

                        {/* Additional Notes */}
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                <FileText size={16} className="mr-2 text-gray-400" />
                                Ghi chú thêm
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows={2}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                placeholder="Thông tin bổ sung (nếu có)..."
                            />
                        </div>
                    </div>

                    {/* Info Note */}
                    <div className="mt-5 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                            <strong>Lưu ý:</strong> Vui lòng nhắc bệnh nhân đến trước giờ hẹn 15 phút để làm thủ tục.
                        </p>
                    </div>

                    {/* Modal Actions */}
                    <div className="mt-6 flex justify-end gap-3 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors flex items-center gap-2"
                        >
                            <CalendarIcon size={18} />
                            Xác nhận đặt lịch
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookAppointmentModal;
