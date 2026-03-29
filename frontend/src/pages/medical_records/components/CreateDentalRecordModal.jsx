import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createDentalRecord } from '../../../services/dentalRecordService';
import appointmentService from '../../../services/appointmentService';

/**
 * CreateDentalRecordModal
 * POST /api/dentist/dental-record/:patientId
 */
const CreateDentalRecordModal = ({
    isOpen,
    onClose,
    onSuccess,
    patientId,
    patientName = '',
    patientPhone = '',
    patientEmail = '',
    patientGender = '',
    patientDateOfBirth = '',
    appointmentId = '',
}) => {
    const [form, setForm] = useState({
        appointment_id: appointmentId,
        full_name: patientName,
        phone: patientPhone,
        email: patientEmail,
        gender: patientGender,
        dob: patientDateOfBirth ? patientDateOfBirth.split('T')[0] : '',
        record_name: '',
        diagnosis: '',
        tooth_status: '',
        total_amount: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingAmount, setIsLoadingAmount] = useState(false);
    const [error, setError] = useState(null);
    // Reset form và fetch total_amount mỗi khi modal mở
    useEffect(() => {
        if (isOpen) {
            // 1. Khởi tạo form với thông tin bệnh nhân có sẵn
            setForm({
                appointment_id: appointmentId,
                full_name: patientName,
                phone: patientPhone,
                email: patientEmail,
                gender: patientGender,
                dob: patientDateOfBirth ? patientDateOfBirth.split('T')[0] : '',
                record_name: '',
                diagnosis: '',
                tooth_status: '',
                total_amount: '', // Sẽ được update sau khi gọi API
                start_date: new Date().toISOString().split('T')[0],
                end_date: '',
            });
            setError(null);

            // 2. Fetch total_amount nếu có appointmentId
            if (appointmentId) {
                const fetchTotalAmount = async () => {
                    setIsLoadingAmount(true);
                    try {
                        const res = await appointmentService.calculatorTotalAmount(appointmentId);
                        console.log('Tổng tiền từ API:', res);
                        const amount = res?.data?.totalAmount || 0;
                        
                        setForm(prev => ({
                            ...prev,
                            total_amount: amount
                        }));
                    } catch (err) {
                        console.error('Lỗi khi tính tổng tiền:', err);
                        // Có thể hiển thị error hoặc giữ nguyên field trống cho user tự điền
                    } finally {
                        setIsLoadingAmount(false);
                    }
                };

                fetchTotalAmount();
            }
        }
    }, [isOpen, appointmentId, patientId, patientName, patientPhone, patientEmail, patientGender, patientDateOfBirth]);

    if (!isOpen) return null;

    const handleChange = (e) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!patientId) return;
        setIsSubmitting(true);
        setError(null);
        try {
            const body = {
                appointment_id: form.appointment_id || undefined,
                full_name: form.full_name.trim(),
                phone: form.phone.trim() || undefined,
                email: form.email.trim() || undefined,
                gender: form.gender === 'MALE' ? true : form.gender === 'FEMALE' ? false : undefined,
                dob: form.dob || undefined,
                record_name: form.record_name.trim(),
                diagnosis: form.diagnosis.trim() || undefined,
                tooth_status: form.tooth_status.trim() || undefined,
                total_amount: form.total_amount ? Number(form.total_amount) : 0,
                start_date: form.start_date || undefined,
                end_date: form.end_date || undefined,
            };
            
            const res = await createDentalRecord(patientId, body);
            onSuccess?.(res.data);
            onClose();
        } catch (err) {
            console.error('Create dental record error:', err);
            setError(err.response?.data?.message || 'Tạo hồ sơ thất bại. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                    <div>
                        <h2 className="text-base font-semibold text-gray-800">Tạo hồ sơ nha khoa mới</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Điền đầy đủ thông tin để tạo hồ sơ</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                        <X size={20} />
                    </button>
                </div>

                {/* Form body */}
                <form id="create-record-form" onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
                    {/* ... (Phần UI Thông tin bệnh nhân giữ nguyên) ... */}
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                            Thông tin bệnh nhân
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Họ và tên <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="full_name"
                                    required
                                    value={form.full_name}
                                    onChange={handleChange}
                                    placeholder="Họ và tên bệnh nhân"
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="0xxxxxxxxx"
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="[EMAIL_ADDRESS]"
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                                <select
                                    name="gender"
                                    value={form.gender}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white transition"
                                >
                                    <option value="">Chọn giới tính</option>
                                    <option value="MALE">Nam</option>
                                    <option value="FEMALE">Nữ</option>
                                    <option value="OTHER">Khác</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                                <input
                                    type="date"
                                    name="dob"
                                    value={form.dob}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white transition"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100" />

                    {/* Section: Thông tin hồ sơ */}
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                            Thông tin hồ sơ
                        </p>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên hồ sơ <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="record_name"
                                    required
                                    value={form.record_name}
                                    onChange={handleChange}
                                    placeholder="VD: Điều trị tủy răng số 6, Nhổ răng khôn..."
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Chẩn đoán
                                </label>
                                <textarea
                                    name="diagnosis"
                                    rows={3}
                                    value={form.diagnosis}
                                    onChange={handleChange}
                                    placeholder="VD: Viêm nướu nhẹ, mảng bám nhiều ở hàm dưới..."
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white transition resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tình trạng răng</label>
                                <input
                                    type="text"
                                    name="tooth_status"
                                    value={form.tooth_status}
                                    onChange={handleChange}
                                    placeholder="VD: Răng 38, 48 mọc lệch..."
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white transition"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={form.start_date}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tổng tiền</label>
                                    <div className="relative">
                                        <input
                                            type="text" // Chuyển sang text để hiển thị được format (1.000.000)
                                            name="total_amount"
                                            // Format số thành chuẩn Việt Nam khi hiển thị
                                            value={form.total_amount ? new Intl.NumberFormat('vi-VN').format(form.total_amount) : ''}
                                            onChange={(e) => {
                                                // Lọc bỏ tất cả ký tự không phải là số (dấu chấm, chữ cái, v.v.)
                                                const rawValue = e.target.value.replace(/\D/g, '');
                                                
                                                // Gọi hàm handleChange gốc với object mô phỏng event
                                                if (handleChange) {
                                                    handleChange({
                                                        target: {
                                                            name: "total_amount",
                                                            value: rawValue ? Number(rawValue) : ""
                                                        }
                                                    });
                                                }
                                            }}
                                            placeholder={isLoadingAmount ? "Đang tính..." : "0"}
                                            disabled={isLoadingAmount}
                                            // Thêm text-right, font-bold, đổi màu chữ và padding-right (pr-14) để chừa chỗ cho chữ VNĐ
                                            className={`w-full pl-3 pr-14 py-2 bg-gray-50 border border-gray-200 rounded-xl text-base font-bold text-teal-600 text-right focus:outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white transition ${isLoadingAmount ? 'opacity-60' : ''}`}
                                        />
                                        
                                        {/* Khu vực icon loading hoặc text VNĐ ở góc phải */}
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                                            {isLoadingAmount ? (
                                                <div className="w-4 h-4 border-2 border-gray-300 border-t-teal-500 rounded-full animate-spin" />
                                            ) : (
                                                <span className="text-sm font-medium text-gray-400 select-none pointer-events-none">
                                                    VNĐ
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                            {error}
                        </p>
                    )}
                </form>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        form="create-record-form"
                        disabled={isSubmitting || isLoadingAmount}
                        className="px-6 py-2 rounded-xl bg-teal-500 text-white text-sm font-medium hover:bg-teal-600 disabled:opacity-50 transition"
                    >
                        {isSubmitting ? 'Đang tạo...' : 'Tạo hồ sơ'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateDentalRecordModal;