import { useState } from 'react';
import { X, User, Stethoscope, Calendar, Users, Phone } from 'lucide-react';
import Button from '../../../components/ui/Button';

const CreateDentalRecordModal = ({
    isOpen,
    onClose,
    onSubmit,
    defaultName = '',
    defaultDob = '',
    defaultGender = 'Nam',
    defaultPhone = '',
}) => {
    const [form, setForm] = useState({
        patient_name: defaultName,
        patient_dob: defaultDob,
        patient_gender: defaultGender,
        patient_phone: defaultPhone,
        record_name: '',
        diagnosis: '',
        tooth_number: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        total_amount: '',
        status: 'IN_PROGRESS',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        await new Promise(r => setTimeout(r, 500));
        onSubmit(form);
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Tạo Hồ Sơ Nha Khoa</h2>
                        <p className="text-sm text-gray-500">Điền đầy đủ thông tin bệnh nhân và hồ sơ</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={22} />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-5">
                    <form id="create-record-form" onSubmit={handleSubmit} className="space-y-5">
                        {/* Patient Info Section */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                                <User size={15} className="text-blue-500" /> Thông tin bệnh nhân
                            </h3>
                            <div className="grid grid-cols-1 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Họ và tên <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="patient_name"
                                        required
                                        value={form.patient_name}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        placeholder="Họ và tên bệnh nhân"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                            <Calendar size={13} /> Ngày sinh
                                        </label>
                                        <input
                                            type="date"
                                            name="patient_dob"
                                            value={form.patient_dob}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                            <Users size={13} /> Giới tính
                                        </label>
                                        <select
                                            name="patient_gender"
                                            value={form.patient_gender}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        >
                                            <option value="Nam">Nam</option>
                                            <option value="Nữ">Nữ</option>
                                            <option value="Khác">Khác</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                        <Phone size={13} /> Số điện thoại
                                    </label>
                                    <input
                                        type="text"
                                        name="patient_phone"
                                        value={form.patient_phone}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        placeholder="0xxxxxxxxx"
                                    />
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-200" />

                        {/* Record Info */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                                <Stethoscope size={15} className="text-green-500" /> Thông tin hồ sơ
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tên hồ sơ <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="record_name"
                                        required
                                        value={form.record_name}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        placeholder="VD: Điều trị tủy răng số 6..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Chẩn đoán <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="diagnosis"
                                        required
                                        rows={3}
                                        value={form.diagnosis}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        placeholder="Nhập chẩn đoán bệnh..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Số răng</label>
                                        <input
                                            type="text"
                                            name="tooth_number"
                                            value={form.tooth_number}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                            placeholder="VD: 18, 26..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tổng tiền (VNĐ)</label>
                                        <input
                                            type="number"
                                            name="total_amount"
                                            value={form.total_amount}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
                                        <input
                                            type="date"
                                            name="start_date"
                                            value={form.start_date}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
                                        <input
                                            type="date"
                                            name="end_date"
                                            value={form.end_date}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                                    <select
                                        name="status"
                                        value={form.status}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    >
                                        <option value="IN_PROGRESS">Đang điều trị</option>
                                        <option value="COMPLETED">Hoàn thành</option>
                                        <option value="CANCELLED">Đã hủy</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-200 flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onClose} className="bg-transparent">
                        Hủy bỏ
                    </Button>
                    <Button type="submit" form="create-record-form" disabled={isSubmitting}>
                        {isSubmitting ? 'Đang lưu...' : '💾 Lưu hồ sơ'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CreateDentalRecordModal;
