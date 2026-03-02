import { X, Plus, Edit, Save, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';

const LeaveRequestModal = ({ request, mode, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        leaveType: 'annual',
        reason: ''
    });

    useEffect(() => {
        if (mode === 'edit' && request) {
            setFormData({
                startDate: request.startDate || '',
                endDate: request.endDate || '',
                leaveType: request.leaveType || 'annual',
                reason: request.reason || ''
            });
        } else if (mode === 'create') {
            // Reset form for create mode
            setFormData({
                startDate: '',
                endDate: '',
                leaveType: 'annual',
                reason: ''
            });
        }
    }, [request, mode]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveDraft = () => {
        if (onSave) {
            onSave(formData, true); // true = save as draft
        }
        onClose();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSave) {
            onSave(formData, false); // false = submit
        }
        onClose();
    };

    const calculateDays = () => {
        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            return diffDays;
        }
        return 0;
    };

    const days = calculateDays();
    const isCreate = mode === 'create';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full mx-4">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${isCreate ? 'bg-blue-100' : 'bg-green-100'}`}>
                            {isCreate ? (
                                <Plus className="text-blue-600" size={24} />
                            ) : (
                                <Edit className="text-green-600" size={24} />
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                {isCreate ? 'Tạo Yêu Cầu Nghỉ Phép' : 'Chỉnh Sửa Yêu Cầu'}
                            </h2>
                            <p className="text-sm text-gray-500">Điền thông tin nghỉ phép</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Từ ngày <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                required
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Đến ngày <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                required
                                min={formData.startDate || new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>

                    {/* Days Calculation */}
                    {days > 0 && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                                <strong>Tổng số ngày nghỉ:</strong> {days} ngày
                            </p>
                        </div>
                    )}

                    {/* Leave Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Loại nghỉ phép <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="leaveType"
                            value={formData.leaveType}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="annual">Phép năm</option>
                            <option value="sick">Nghỉ ốm</option>
                            <option value="personal">Việc riêng</option>
                            <option value="other">Khác</option>
                        </select>
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Lý do <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            required
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            placeholder="Nhập lý do nghỉ phép..."
                        />
                    </div>

                    {/* Info */}
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                            <strong>Lưu ý:</strong>
                        </p>
                        <ul className="text-sm text-yellow-700 mt-1 ml-4 list-disc">
                            <li>Lưu bản nháp để tiếp tục chỉnh sửa sau</li>
                            <li>Gửi yêu cầu để chờ quản lý phê duyệt</li>
                            <li>Yêu cầu đã gửi không thể chỉnh sửa</li>
                        </ul>
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
                            type="button"
                            onClick={handleSaveDraft}
                            className="px-6 py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center gap-2"
                        >
                            <FileText size={18} />
                            Lưu bản nháp
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                        >
                            <Save size={18} />
                            Gửi yêu cầu
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LeaveRequestModal;
