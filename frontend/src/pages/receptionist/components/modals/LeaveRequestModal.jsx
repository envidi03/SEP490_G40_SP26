import { X, Plus, Edit, Save, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';

const LeaveRequestModal = ({ request, mode, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        startedDate: '',
        endDate: '',
        type: 'ANNUAL',
        reason: ''
    });

    useEffect(() => {
        if (mode === 'edit' && request) {
            setFormData({
                startedDate: request.startedDate || '',
                endDate: request.endDate || '',
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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-6 max-w-2xl w-full mx-4">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${isCreate ? 'bg-primary-100' : 'bg-emerald-100'}`}>
                            {isCreate ? (
                                <Plus className="text-primary-600" size={24} />
                            ) : (
                                <Edit className="text-emerald-600" size={24} />
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                {isCreate ? 'Tạo Yêu Cầu Nghỉ Phép' : 'Chỉnh Sửa Yêu Cầu'}
                            </h2>
                            <p className="text-sm text-gray-500">Điền thông tin chi tiết về kỳ nghỉ của bạn</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors">
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
                                name="startedDate"
                                value={formData.startedDate}
                                onChange={handleChange}
                                required
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
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
                                min={formData.startedDate || new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>

                    {/* Days Calculation */}
                    {days > 0 && (
                        <div className="p-3 bg-primary-50 border border-primary-100 rounded-lg">
                            <p className="text-sm text-primary-800 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                                <strong>Tổng thời gian nghỉ:</strong> {days} ngày
                            </p>
                        </div>
                    )}

                    {/* Leave Type & Reason */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Loại nghỉ phép <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="ANNUAL">Phép năm (Có hưởng lương)</option>
                                <option value="SICK">Nghỉ ốm (Cần giấy khám bệnh)</option>
                                <option value="PERSONAL_LEAVE">Việc riêng (Không hưởng lương)</option>
                                <option value="MATERNITY">Thai sản (Maternity)</option>
                                <option value="BEREAVEMENT">Tang chế (Bereavement)</option>
                                <option value="EMERGENCY">Khẩn cấp (Emergency)</option>
                                <option value="UNPAID">Nghỉ không lương (Unpaid)</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Lý do chi tiết <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                required
                                rows={3}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                placeholder="Vui lòng nêu rõ lý do nghỉ phép..."
                            />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <p className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-1.5">
                            <FileText size={16} /> Lưu ý quan trọng:
                        </p>
                        <ul className="text-sm text-amber-700 space-y-1.5 ml-1 list-inside list-disc">
                            <li>Lưu <strong className="font-semibold text-amber-900">Bản nháp</strong> nếu bạn chưa quyết định chắc chắn thời gian báo nghỉ.</li>
                            <li>Sau khi nhấn <strong className="font-semibold text-amber-900">Gửi yêu cầu</strong>, bạn sẽ không thể tự ý thay đổi nội dung.</li>
                            <li>Vui lòng gửi yêu cầu trước ít nhất <strong className="font-semibold text-amber-900">3 ngày</strong> đối với nghỉ phép có kế hoạch.</li>
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="button"
                            onClick={handleSaveDraft}
                            className="px-6 py-2.5 border border-primary-500 text-primary-600 font-medium rounded-lg hover:bg-primary-50 flex items-center gap-2 transition-colors"
                        >
                            <FileText size={18} />
                            Lưu bản nháp
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 flex items-center gap-2 transition-colors shadow-sm"
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
