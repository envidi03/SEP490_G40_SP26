import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

import { useEffect } from 'react';

const LeaveRequestForm = ({ onSubmit, onCancel, initialData }) => {
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
        <form onSubmit={handleSubmit} className="space-y-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lý do
                </label>
                <textarea
                    name="reason"
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    value={formData.reason}
                    onChange={handleChange}
                    required
                    placeholder="Nhập lý do xin nghỉ..."
                ></textarea>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Hủy bỏ
                </Button>
                <Button type="submit">
                    {initialData ? 'Cập nhật' : 'Gửi yêu cầu'}
                </Button>
            </div>
        </form>
    );
};

export default LeaveRequestForm;
