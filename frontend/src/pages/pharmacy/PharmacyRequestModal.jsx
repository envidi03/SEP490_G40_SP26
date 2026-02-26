import React, { useState } from 'react';
import Modal from '../../components/ui/Modal';
import { mockMedicines } from '../../utils/mockData';

const PharmacyRequestModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        medicineId: '',
        requestedQuantity: '',
        priority: 'medium',
        note: ''
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.medicineId) newErrors.medicineId = 'Vui lòng chọn thuốc';
        if (!formData.requestedQuantity || formData.requestedQuantity <= 0) {
            newErrors.requestedQuantity = 'Số lượng phải lớn hơn 0';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            const selectedMedicine = mockMedicines.find(m => m.id === formData.medicineId);

            const requestData = {
                ...formData,
                medicineName: selectedMedicine?.medicine_name || 'Unknown',
                currentStock: selectedMedicine?.quantity || 0,
                minStock: 50, // Mock value as it's not in medicine object
                requestedQuantity: parseInt(formData.requestedQuantity)
            };

            onSubmit(requestData);
            handleClose();
        }
    };

    const handleClose = () => {
        setFormData({
            medicineId: '',
            requestedQuantity: '',
            priority: 'medium',
            note: ''
        });
        setErrors({});
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Tạo Yêu Cầu Bổ Sung Thuốc"
            size="lg"
            footer={
                <div className="flex justify-end gap-2">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                        Gửi yêu cầu
                    </button>
                </div>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Chọn thuốc <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="medicineId"
                        value={formData.medicineId}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.medicineId ? 'border-red-500' : 'border-gray-300'
                            }`}
                    >
                        <option value="">-- Chọn thuốc --</option>
                        {mockMedicines.map(med => (
                            <option key={med.id} value={med.id}>
                                {med.medicine_name} (Tồn: {med.quantity} {med.unit})
                            </option>
                        ))}
                    </select>
                    {errors.medicineId && <p className="text-red-500 text-xs mt-1">{errors.medicineId}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Số lượng yêu cầu <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="requestedQuantity"
                            value={formData.requestedQuantity}
                            onChange={handleChange}
                            min="1"
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.requestedQuantity ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Nhập số lượng"
                        />
                        {errors.requestedQuantity && <p className="text-red-500 text-xs mt-1">{errors.requestedQuantity}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mức độ ưu tiên
                        </label>
                        <select
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="low">Thấp</option>
                            <option value="medium">Trung bình</option>
                            <option value="high">Cao</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ghi chú
                    </label>
                    <textarea
                        name="note"
                        value={formData.note}
                        onChange={handleChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="Nhập lý do hoặc ghi chú thêm..."
                    ></textarea>
                </div>
            </div>
        </Modal>
    );
};

export default PharmacyRequestModal;
