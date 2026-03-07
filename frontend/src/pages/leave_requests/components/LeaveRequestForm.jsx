import React, { useState } from 'react';

const LeaveRequestForm = ({ onSubmit, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        leave_type: 'SICK_LEAVE',
        reason: ''
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
        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">
                        Từ ngày <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1">
                        Đến ngày <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
                    />
                </div>
            </div>

            <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">
                    Loại nghỉ phép <span className="text-red-500">*</span>
                </label>
                <select
                    name="leave_type"
                    value={formData.leave_type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-[13px] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors bg-white"
                >
                    <option value="SICK_LEAVE">Nghỉ ốm</option>
                    <option value="ANNUAL_LEAVE">Nghỉ phép năm</option>
                    <option value="PERSONAL_LEAVE">Việc riêng</option>
                </select>
            </div>

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
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-[13px] font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
                >
                    Hủy bỏ
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-[13px] font-medium text-white bg-teal-500 rounded-xl hover:bg-teal-600 shadow-sm shadow-teal-500/20 transition-all disabled:opacity-50"
                >
                    {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
                </button>
            </div>
        </form>
    );
};

export default LeaveRequestForm;
