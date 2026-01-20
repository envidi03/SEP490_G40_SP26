import React, { useState } from 'react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { Save, X } from 'lucide-react';

const RecordForm = ({ onSubmit, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState({
        diagnosis: '',
        treatment: '',
        notes: '',
        status: 'Completed'
    });

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
        <Card title="Thông tin khám bệnh">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Diagnosis */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Chẩn đoán <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        name="diagnosis"
                        required
                        rows="3"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="Nhập chẩn đoán bệnh..."
                        value={formData.diagnosis}
                        onChange={handleChange}
                    ></textarea>
                </div>

                {/* Treatment */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phương pháp điều trị <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        name="treatment"
                        required
                        rows="4"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="Mô tả phương pháp điều trị..."
                        value={formData.treatment}
                        onChange={handleChange}
                    ></textarea>
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ghi chú thêm
                    </label>
                    <textarea
                        name="notes"
                        rows="2"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="Ghi chú về dị ứng, lưu ý đặc biệt..."
                        value={formData.notes}
                        onChange={handleChange}
                    ></textarea>
                </div>

                {/* Status */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Trạng thái
                    </label>
                    <select
                        name="status"
                        className="w-full md:w-1/3 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.status}
                        onChange={handleChange}
                    >
                        <option value="Completed">Hoàn thành</option>
                        <option value="In Progress">Đang điều trị</option>
                        <option value="Pending">Chờ tái khám</option>
                    </select>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
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
