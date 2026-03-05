import { useState } from 'react';
import { X, User, Phone, Calendar, Users } from 'lucide-react';
import Button from '../../../components/ui/Button';

const PatientInfoModal = ({ isOpen, onClose, appointment, onConfirm }) => {
    const [form, setForm] = useState({
        name: appointment?.patientName || '',
        dob: '',
        gender: 'Nam',
        phone: appointment?.patientPhone || '',
    });

    if (!isOpen || !appointment) return null;

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(form);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Thông tin Bệnh nhân</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Xác nhận thông tin trước khi tạo hồ sơ</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={22} />
                    </button>
                </div>

                {/* Appointment info badge */}
                <div className="mx-5 mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800">
                    <strong>Lịch hẹn:</strong> {appointment.code} — {appointment.date} {appointment.time}<br />
                    <strong>Lý do:</strong> {appointment.reason}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <User size={14} /> Họ và tên <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={form.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            placeholder="Nhập họ và tên bệnh nhân"
                        />
                    </div>

                    {/* DOB & Gender */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                <Calendar size={14} /> Ngày sinh
                            </label>
                            <input
                                type="date"
                                name="dob"
                                value={form.dob}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                <Users size={14} /> Giới tính
                            </label>
                            <select
                                name="gender"
                                value={form.gender}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            >
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                                <option value="Khác">Khác</option>
                            </select>
                        </div>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <Phone size={14} /> Số điện thoại
                        </label>
                        <input
                            type="text"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            placeholder="0xxxxxxxxx"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                        <Button type="button" variant="outline" onClick={onClose} className="bg-transparent">
                            Hủy
                        </Button>
                        <Button type="submit">
                            Xem hồ sơ bệnh nhân →
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PatientInfoModal;
