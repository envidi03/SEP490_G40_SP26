import { X, Wrench, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

const ReportEquipmentModal = ({ appointment, isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        equipmentName: '',
        issueType: 'malfunction',
        severity: 'medium',
        description: ''
    });

    if (!isOpen || !appointment) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = {
            ...formData,
            appointmentId: appointment.id,
            reportedAt: new Date().toISOString(),
            reportedBy: 'Current User' // TODO: Get from auth context
        };
        if (onSubmit) {
            onSubmit(appointment.id, data);
        }
        // Reset form
        setFormData({
            equipmentName: '',
            issueType: 'malfunction',
            severity: 'medium',
            description: ''
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full mx-4">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Wrench className="text-orange-600" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Báo Cáo Sự Cố Thiết Bị</h2>
                            <p className="text-sm text-gray-500">Thông báo thiết bị hỏng hóc</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                {/* Appointment Context */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700">
                        <span className="font-medium">Liên quan đến lịch hẹn:</span> {appointment.patientName} - {appointment.date} {appointment.time}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Equipment Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tên thiết bị <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="equipmentName"
                            value={formData.equipmentName}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">-- Chọn thiết bị --</option>
                            <option value="Ghế nha khoa">Ghế nha khoa</option>
                            <option value="Máy X-quang">Máy X-quang</option>
                            <option value="Máy khoan">Máy khoan</option>
                            <option value="Máy hút">Máy hút</option>
                            <option value="Máy cạo vôi siêu âm">Máy cạo vôi siêu âm</option>
                            <option value="Đèn chiếu sáng">Đèn chiếu sáng</option>
                            <option value="Tủ tiệt trùng">Tủ tiệt trùng</option>
                            <option value="Thiết bị khác">Thiết bị khác</option>
                        </select>
                    </div>

                    {/* Issue Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Loại sự cố <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="issueType"
                            value={formData.issueType}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="malfunction">Hỏng hóc</option>
                            <option value="maintenance">Cần bảo trì</option>
                            <option value="broken">Hư hỏng hoàn toàn</option>
                            <option value="missing">Thiếu phụ kiện</option>
                            <option value="other">Khác</option>
                        </select>
                    </div>

                    {/* Severity */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mức độ nghiêm trọng <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            <label className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${formData.severity === 'low'
                                    ? 'border-yellow-500 bg-yellow-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}>
                                <input
                                    type="radio"
                                    name="severity"
                                    value="low"
                                    checked={formData.severity === 'low'}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <span className={`text-sm font-medium ${formData.severity === 'low' ? 'text-yellow-700' : 'text-gray-700'
                                    }`}>
                                    Thấp
                                </span>
                            </label>
                            <label className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${formData.severity === 'medium'
                                    ? 'border-orange-500 bg-orange-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}>
                                <input
                                    type="radio"
                                    name="severity"
                                    value="medium"
                                    checked={formData.severity === 'medium'}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <span className={`text-sm font-medium ${formData.severity === 'medium' ? 'text-orange-700' : 'text-gray-700'
                                    }`}>
                                    Trung bình
                                </span>
                            </label>
                            <label className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${formData.severity === 'high'
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}>
                                <input
                                    type="radio"
                                    name="severity"
                                    value="high"
                                    checked={formData.severity === 'high'}
                                    onChange={handleChange}
                                    className="sr-only"
                                />
                                <span className={`text-sm font-medium ${formData.severity === 'high' ? 'text-red-700' : 'text-gray-700'
                                    }`}>
                                    Cao
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mô tả chi tiết <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            placeholder="Mô tả chi tiết về sự cố, triệu chứng, thời điểm xảy ra..."
                        />
                    </div>

                    {/* Warning */}
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start gap-2">
                            <AlertTriangle size={20} className="text-yellow-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-yellow-800">Lưu ý quan trọng</p>
                                <p className="text-sm text-yellow-700 mt-1">
                                    Báo cáo sẽ được gửi đến bộ phận kỹ thuật. Đối với sự cố nghiêm trọng, vui lòng thông báo trực tiếp cho quản lý.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
                        >
                            <Wrench size={18} />
                            Gửi Báo Cáo
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportEquipmentModal;
