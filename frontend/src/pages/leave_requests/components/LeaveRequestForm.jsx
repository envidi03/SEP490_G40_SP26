import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const LeaveRequestForm = ({ onSubmit, onCancel, initialData, isSubmitting }) => {
    const [errors, setErrors] = useState({});
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
        setErrors({});
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.startedDate) newErrors.startedDate = 'Vui lòng chọn ngày bắt đầu';
        if (!formData.endDate) newErrors.endDate = 'Vui lòng chọn ngày kết thúc';
        if (!formData.reason || !formData.reason.trim()) newErrors.reason = 'Vui lòng nhập lý do xin nghỉ';
        
        if (formData.startedDate && formData.endDate) {
            if (new Date(formData.startedDate) > new Date(formData.endDate)) {
                newErrors.endDate = 'Ngày kết thúc không được trước ngày bắt đầu';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-5 mt-2">
            <div className="grid grid-cols-2 gap-4">
                <Input
                    label="Từ ngày"
                    type="date"
                    name="startedDate"
                    value={formData.startedDate}
                    onChange={handleChange}
                    error={errors.startedDate}
                />
                <Input
                    label="Đến ngày"
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    error={errors.endDate}
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
                error={errors.type}
            />

            <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">
                    Lý do xin nghỉ <span className="text-red-500">*</span>
                </label>
                <textarea
                    name="reason"
                    rows="3"
                    className={clsx(
                        "w-full px-3 py-2 text-[13px] border rounded-xl focus:outline-none transition-colors resize-none",
                        errors.reason 
                            ? "border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500" 
                            : "border-gray-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    )}
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="Vui lòng nhập lý do cụ thể..."
                ></textarea>
                {errors.reason && (
                    <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
                )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-[13px] font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
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
