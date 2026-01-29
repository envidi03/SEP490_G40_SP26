import { X, Edit, Save, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';

const UpdateRecordModal = ({ record, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        diagnosis: '',
        treatment: '',
        prescription: '',
        notes: ''
    });

    useEffect(() => {
        if (record) {
            setFormData({
                diagnosis: record.diagnosis || '',
                treatment: record.treatment || '',
                prescription: record.prescription || '',
                notes: record.notes || ''
            });
        }
    }, [record]);

    if (!isOpen || !record) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveDraft = () => {
        if (onSave) {
            onSave(record.id, formData, true); // true = save as draft
        }
        onClose();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSave) {
            onSave(record.id, formData, false); // false = save as final
        }
        onClose();
    };

    const isDraft = record.isDraft || record.status === 'draft';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Edit className="text-green-600" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                {isDraft ? 'Chỉnh Sửa Bản Nháp' : 'Cập Nhật Hồ Sơ'}
                            </h2>
                            <p className="text-sm text-gray-500">Điền thông tin khám bệnh</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                {/* Patient Info Banner */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="text-blue-600 font-medium">Bệnh nhân:</span>
                            <span className="ml-2 text-blue-900">{record.patientName}</span>
                        </div>
                        <div>
                            <span className="text-blue-600 font-medium">Ngày khám:</span>
                            <span className="ml-2 text-blue-900">{record.date}</span>
                        </div>
                        <div>
                            <span className="text-blue-600 font-medium">Bác sĩ:</span>
                            <span className="ml-2 text-blue-900">{record.doctorName}</span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Diagnosis */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Chẩn đoán <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="diagnosis"
                            value={formData.diagnosis}
                            onChange={handleChange}
                            required
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            placeholder="Nhập kết quả chẩn đoán..."
                        />
                    </div>

                    {/* Treatment */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Điều trị <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="treatment"
                            value={formData.treatment}
                            onChange={handleChange}
                            required
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            placeholder="Mô tả quy trình điều trị đã thực hiện..."
                        />
                    </div>

                    {/* Prescription */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Đơn thuốc
                        </label>
                        <textarea
                            name="prescription"
                            value={formData.prescription}
                            onChange={handleChange}
                            rows={5}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            placeholder="Danh sách thuốc kê đơn (tên thuốc, liều lượng, cách dùng)&#10;Ví dụ:&#10;- Amoxicillin 500mg: 1 viên x 3 lần/ngày x 5 ngày&#10;- Paracetamol 500mg: 1-2 viên khi đau, tối đa 4g/ngày"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Để trống nếu không kê đơn thuốc
                        </p>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ghi chú thêm
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            placeholder="Lưu ý cho bệnh nhân, lịch tái khám, biến chứng có thể xảy ra..."
                        />
                    </div>

                    {/* Info Banner */}
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                            <strong>Lưu ý:</strong> Bạn có thể lưu bản nháp để tiếp tục chỉnh sửa sau,
                            hoặc lưu chính thức để hoàn thành hồ sơ.
                        </p>
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
                            Lưu chính thức
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateRecordModal;
