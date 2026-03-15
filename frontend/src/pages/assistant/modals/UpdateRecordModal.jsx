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
            const treatmentInfo = record.treatment || (record.treatments?.length > 0
                ? record.treatments.map(t => t.note).filter(Boolean).join('\n')
                : '');

            let prescriptionInfo = record.prescription || '';
            if (!prescriptionInfo && record.treatments) {
                const meds = [];
                record.treatments.forEach(t => {
                    if (t.medicine_usage && t.medicine_usage.length > 0) {
                        t.medicine_usage.forEach(m => {
                            // Format readable: ưu tiên note, sau đó tên thuốc + liều
                            if (m.note) {
                                meds.push(m.note);
                            } else {
                                const name = m.medicine_id?.medicine_name || m.medicine_name || '';
                                const dosage = m.medicine_id?.dosage || m.dosage || '';
                                const qty = m.quantity ? `x${m.quantity}` : '';
                                const usage = m.usage || m.dosage_form || '';
                                const parts = [name, dosage, qty, usage].filter(Boolean);
                                if (parts.length > 0) meds.push(`- ${parts.join(' ')}`);
                            }
                        });
                    }
                });
                if (meds.length > 0) prescriptionInfo = meds.join('\n');
            }

            setFormData({
                diagnosis: record.diagnosis || '',
                treatment: treatmentInfo,
                prescription: prescriptionInfo,
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
        <div className="fixed inset-0 bg-white/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[24px] shadow-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 border border-gray-100">
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
                            <span className="text-blue-600 font-medium">Hồ sơ:</span>
                            <span className="ml-2 text-blue-900">{record.record_name || 'Không xác định'}</span>
                        </div>
                        <div>
                            <span className="text-blue-600 font-medium">Bệnh nhân:</span>
                            <span className="ml-2 text-blue-900">{record.full_name || record.patientName}</span>
                        </div>
                        <div>
                            <span className="text-blue-600 font-medium">Bác sĩ:</span>
                            <span className="ml-2 text-blue-900">{record.doctor_info?.profile?.full_name || record.doctorName || 'Chưa có'}</span>
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
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 py-2.5 rounded-xl border border-gray-200 text-sm font-extrabold text-gray-500 hover:bg-gray-50 hover:text-gray-700 active:scale-95 transition-all"
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            onClick={handleSaveDraft}
                            className="px-8 py-2.5 rounded-xl border border-teal-500 text-teal-600 text-sm font-bold hover:bg-teal-50 active:scale-95 transition-all flex items-center gap-2"
                        >
                            <FileText size={18} />
                            Lưu bản nháp
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-2.5 bg-teal-500 text-white rounded-xl text-sm font-[900] hover:bg-teal-600 active:scale-95 transition-all shadow-lg shadow-teal-500/25 flex items-center gap-2"
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
