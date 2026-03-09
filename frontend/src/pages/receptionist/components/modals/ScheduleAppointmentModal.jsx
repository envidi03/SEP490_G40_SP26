import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock, User, FileText, Loader2 } from 'lucide-react';
import appointmentService from '../../../../services/appointmentService';
import staffService from '../../../../services/staffService';
import Toast from '../../../../components/ui/Toast';

const ScheduleAppointmentModal = ({ patient, isOpen, onClose, onSchedule }) => {
    const [formData, setFormData] = useState({
        appointment_date: '',
        appointment_time: '',
        doctorId: '',
        reason: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        if (isOpen) {
            fetchDoctors();
            // Reset form
            setFormData({
                appointment_date: '',
                appointment_time: '',
                doctorId: '',
                reason: '',
                notes: ''
            });
        }
    }, [isOpen]);

    const fetchDoctors = async () => {
        try {
            const response = await staffService.getStaffs({ role: 'DENTIST' });
            const data = response.data?.data || response.data || [];
            const staffList = Array.isArray(data) ? data : data.data || [];
            setDoctors(staffList);
        } catch (error) {
            console.error('Error fetching doctors:', error);
        }
    };

    if (!isOpen || !patient) return null;

    const patientName = patient.profile?.full_name || patient.name || 'N/A';
    const patientPhone = patient.profile?.phone || patient.phone || '';
    const patientEmail = patient.profile?.email || patient.email || '';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const submissionData = {
                ...formData,
                full_name: patientName,
                phone: patientPhone,
                email: patientEmail,
                patient_id: patient._id || patient.id
            };

            const response = await appointmentService.staffCreateAppointment(submissionData);
            setToast({ show: true, message: 'Đặt lịch hẹn thành công!', type: 'success' });

            if (onSchedule) {
                onSchedule(response.data?.data || response.data);
            }

            setTimeout(() => {
                onClose();
            }, 1000);
        } catch (error) {
            console.error('Error scheduling appointment:', error);
            setToast({
                show: true,
                message: error.response?.data?.message || 'Có lỗi xảy ra khi đặt lịch.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Đặt Lịch Hẹn</h2>
                        <p className="text-sm text-gray-500 mt-1">Tạo lịch hẹn khám mới cho bệnh nhân</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Patient Info Banner */}
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <span className="text-blue-600 font-bold text-lg">
                                {patientName.charAt(0)}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Bệnh nhân</p>
                            <p className="font-semibold text-gray-900">{patientName}</p>
                            <p className="text-xs text-gray-500">{patientPhone} • {patientEmail}</p>
                        </div>
                    </div>
                </div>

                {/* Appointment Form */}
                <form onSubmit={handleSubmit}>
                    <div className="space-y-5">
                        {/* Date & Time */}
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

                        {/* Doctor Selection */}
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                <User size={16} className="mr-2 text-gray-400" />
                                Bác sĩ khám <span className="text-red-500 ml-1">*</span>
                            </label>
                            <select
                                name="doctorId"
                                value={formData.doctorId}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="">Chọn bác sĩ</option>
                                {doctors.map(doc => (
                                    <option key={doc._id} value={doc._id}>
                                        {doc.profile?.full_name || doc.name}
                                    </option>
                                ))}
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
                                placeholder="Mô tả triệu chứng, lý do khám bệnh..."
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

                    {/* Info Banner */}
                    <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                            <strong>Lưu ý:</strong> Vui lòng đến trước giờ hẹn 15 phút để làm thủ tục tiếp đón.
                        </p>
                    </div>

                    {/* Modal Actions */}
                    <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <CalendarIcon size={18} />}
                            {loading ? 'Đang đặt lịch...' : 'Xác nhận đặt lịch'}
                        </button>
                    </div>
                </form>

                <Toast
                    show={toast.show}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            </div>
        </div>
    );
};

export default ScheduleAppointmentModal;
