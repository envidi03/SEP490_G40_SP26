import React, { useRef, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import EquipmentServiceSelector from './EquipmentServiceSelector';
import MultiImageUploader from './MultiImageUploader';

const ServiceFormModal = ({
    show,
    isEditMode,
    serviceForm,
    setServiceForm,
    errors,
    setErrors,
    categories,
    onSave,
    onClose,
    loading
}) => {
    if (!show) return null;

    const handleInputChange = (field, value) => {
        setServiceForm({ ...serviceForm, [field]: value });
        if (errors[field]) {
            const newErrors = { ...errors };
            delete newErrors[field];
            setErrors(newErrors);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm" onClick={onClose} />
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl transform transition-all">
                    <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-t-2xl p-6">
                        <h2 className="text-2xl font-bold">
                            {isEditMode ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}
                        </h2>
                        <p className="text-blue-100 mt-1">
                            {isEditMode ? 'Cập nhật thông tin dịch vụ' : 'Điền thông tin để tạo dịch vụ mới'}
                        </p>
                    </div>

                    <div className="p-8 max-h-[80vh] overflow-y-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            {/* Left Column: Basic Info */}
                            <div className="space-y-6">
                                {/* Service Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Tên dịch vụ <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={serviceForm.service_name}
                                        onChange={(e) => handleInputChange('service_name', e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                                            errors.service_name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                        placeholder="Khám tổng quát"
                                    />
                                    {errors.service_name && (
                                        <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                                            <span className="w-1 h-1 rounded-full bg-red-500" />
                                            {errors.service_name}
                                        </p>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Mô tả chi tiết
                                    </label>
                                    <textarea
                                        value={serviceForm.description}
                                        onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                                        rows={6}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                                        placeholder="Mô tả kỹ các đặc điểm, quy trình hoặc lưu ý của dịch vụ này..."
                                    />
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Trạng thái hoạt động <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={serviceForm.status}
                                        onChange={(e) => setServiceForm({ ...serviceForm, status: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                                    >
                                        <option value="AVAILABLE">Hoạt động (Sẵn sàng)</option>
                                        <option value="UNAVAILABLE">Tạm ngưng (Không khả dụng)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Right Column: Media & Equipment */}
                            <div className="space-y-6">
                                {/* Multi Image Upload */}
                                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                    <MultiImageUploader
                                        images={serviceForm.images || []}
                                        onChange={(newImages) => setServiceForm({
                                            ...serviceForm,
                                            images: newImages,
                                            icon: newImages.length > 0 ? newImages[0] : (serviceForm.icon || '')
                                        })}
                                        maxImages={5}
                                        label="Hình ảnh gói dịch vụ (Tối đa 5 ảnh)"
                                    />
                                </div>

                                {/* Equipment Service Selector */}
                                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                    <EquipmentServiceSelector
                                        equipmentServices={serviceForm.equipment_service || []}
                                        setEquipmentServices={(equipments) => setServiceForm({ ...serviceForm, equipment_service: equipments })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex gap-3 justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={onSave}
                            disabled={loading}
                            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isEditMode ? 'Cập nhật' : 'Thêm dịch vụ'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceFormModal;
