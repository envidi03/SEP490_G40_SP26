import React, { useState } from 'react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { Save, X } from 'lucide-react';

const RecordForm = ({ onSubmit, onCancel, isSubmitting, initialData }) => {
    const [formData, setFormData] = useState({
        record_name: '',
        diagnosis: '',
        tooth_number: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        total_amount: '',
        status: 'IN_PROGRESS',
        ...initialData // Merge initialData here
    });

    // useEffect removed as we use key in parent to reset state

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Card title="Thông tin hồ sơ nha khoa" className="h-full overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Record Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên hồ sơ <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="record_name"
                        required
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Ví dụ: Trám răng sâu..."
                        value={formData.record_name}
                        onChange={handleChange}
                    />
                </div>

                {/* Diagnosis */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Chẩn đoán <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        name="diagnosis"
                        required
                        rows="3"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Nhập chẩn đoán bệnh..."
                        value={formData.diagnosis}
                        onChange={handleChange}
                    ></textarea>
                </div>

                {/* Tooth Number & Total Amount */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Số răng
                        </label>
                        <input
                            type="text"
                            name="tooth_number"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="VD: 18, 26..."
                            value={formData.tooth_number}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tổng tiền (VNĐ)
                        </label>
                        <input
                            type="number"
                            name="total_amount"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="0"
                            value={formData.total_amount}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ngày bắt đầu
                        </label>
                        <input
                            type="date"
                            name="start_date"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.start_date}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ngày kết thúc
                        </label>
                        <input
                            type="date"
                            name="end_date"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.end_date}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Status */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Trạng thái
                    </label>
                    <select
                        name="status"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.status}
                        onChange={handleChange}
                    >
                        <option value="IN_PROGRESS">Đang thực hiện (IN_PROGRESS)</option>
                        <option value="COMPLETED">Hoàn thành (COMPLETED)</option>
                        <option value="CANCELLED">Đã hủy (CANCELLED)</option>
                    </select>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="flex items-center gap-2"
                    >
                        <X size={18} />
                        Hủy bỏ
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-2"
                    >
                        <Save size={18} />
                        {isSubmitting ? 'Đang lưu...' : 'Lưu hồ sơ'}
                    </Button>
                </div>
            </form>
        </Card>
    );
};

export default RecordForm;
