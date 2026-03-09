import React, { useState } from 'react';

import { useEffect } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const LeaveRequestForm = ({ onSubmit, onCancel, initialData, isSubmitting }) => {
    const [formData, setFormData] = useState({
        startedDate: '',
        endDate: '',
        type: 'SICK',
        reason: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                startedDate: initialData.startedDate ? new Date(initialData.startedDate).toISOString().split('T')[0] : '',
                endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
                type: initialData.type || 'SICK',
                reason: initialData.reason || ''
            });
        } else {
            setFormData({
                startedDate: '',
                endDate: '',
                type: 'SICK',
                reason: ''
            });
        }
    }, [initialData]);

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
        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Từ ngày"
                    type="date"
                    name="startedDate"
                    value={formData.startedDate}
                    onChange={handleChange}
                    required
                />
                <Input
                    label="Đến ngày"
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                />
            </div>

            <Select
                label="Loại nghỉ"
                name="type"
                value={formData.type}
                onChange={handleChange}
                options={[
                    { value: 'SICK', label: 'Nghỉ ốm (Sick)' },
                    { value: 'ANNUAL', label: 'Nghỉ phép năm (Annual)' },
                    { value: 'MATERNITY', label: 'Thai sản (Maternity)' },
                    { value: 'UNPAID', label: 'Không lương (Unpaid)' },
                    { value: 'BEREAVEMENT', label: 'Tang chế (Bereavement)' },
                    { value: 'EMERGENCY', label: 'Khẩn cấp (Emergency)' }
                ]}
            />

            <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">
                    Lý do xin nghỉ <span className="text-red-500">*</span>
                </label>
                <textarea
                    name="reason"
                    rows="3"
                    className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors resize-none"
                    value={formData.reason}
                    onChange={handleChange}
                    required
                    placeholder="Vui lòng nhập lý do cụ thể..."
                ></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-[13px] font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
                >
                    Hủy bỏ
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <div className="flex items-center gap-2">
                            Đang xử lý...
                        </div>
                    ) : (initialData ? 'Cập nhật' : 'Gửi yêu cầu')}
                </Button>
            </div>
        </form>
    );
};

export default LeaveRequestForm;
