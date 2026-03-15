import { X, Plus, Edit, Save } from 'lucide-react';
import { useState, useEffect } from 'react';

const LeaveRequestModal = ({ request, mode, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        startedDate: '',
        endDate: '',
        type: 'ANNUAL',
        reason: ''
    });

    // Handle string to valid date string format YYYY-MM-DD
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        return d.toISOString().split('T')[0];
    };

    useEffect(() => {
        if (mode === 'edit' && request) {
            setFormData({
                startedDate: formatDateForInput(request.startedDate),
                endDate: formatDateForInput(request.endDate),
                type: request.type || 'ANNUAL',
                reason: request.reason || ''
            });
        } else if (mode === 'create') {
            // Reset form for create mode
            setFormData({
                startedDate: '',
                endDate: '',
                type: 'ANNUAL',
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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSave) {
            // Chuẩn bị payload chuẩn theo backend schema
            const payload = {
                startedDate: formData.startedDate,
                endDate: formData.endDate,
                type: formData.type,
                reason: formData.reason
            };
            onSave(payload);
        }
    };

    const calculateDays = () => {
        if (formData.startedDate && formData.endDate) {
            const start = new Date(formData.startedDate);
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
        <div className="fixed inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-6 max-w-2xl w-full mx-4 border border-gray-200">
                <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${isCreate ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                            {isCreate ? <Plus size={24} /> : <Edit size={24} />}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                {isCreate ? 'Tạo Yêu Cầu Nghỉ Phép' : 'Chỉnh Sửa Đơn Nghỉ Phép'}
                            </h2>
                            <p className="text-sm text-gray-500">Điền thông tin và thời gian nghỉ</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 flex rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-5 mb-2">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Từ ngày <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="startedDate"
                                value={formData.startedDate}
                                onChange={handleChange}
                                required
                                min={new Date().toISOString().split('T')[0]} // Cannot be past
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Đến ngày <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                required
                                min={formData.startedDate || new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Days Calculation Banner */}
                    {days > 0 && (
                        <div className="p-3 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl flex items-center justify-center gap-2">
                            <span className="text-sm">Hệ thống ghi nhận tổng cộng: </span>
                            <strong className="text-lg">{days} ngày nghỉ</strong>
                        </div>
                    )}

                    {/* Leave Type */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Lý do xin nghỉ <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        >
                            <option value="ANNUAL">Phép năm định kỳ</option>
                            <option value="SICK">Nghỉ ốm / Khám bệnh</option>
                            <option value="MATERNITY">Nghỉ thai sản</option>
                            <option value="BEREAVEMENT">Nhà có tang</option>
                            <option value="EMERGENCY">Nghỉ khẩn cấp</option>
                            <option value="UNPAID">Nghỉ không lương</option>
                        </select>
                    </div>

                    {/* Reason Details */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Chi tiết (Không bắt buộc)
                        </label>
                        <textarea
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                            placeholder="Mô tả cụ thể nếu cần thiết..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                        >
                            Đóng
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2 font-medium transition-all shadow-md shadow-blue-600/20 active:scale-[0.98]"
                        >
                            <Save size={18} />
                            Đệ trình lên Quản lý
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LeaveRequestModal;
