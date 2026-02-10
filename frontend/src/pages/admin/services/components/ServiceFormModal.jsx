import React from 'react';
import EquipmentServiceSelector from './EquipmentServiceSelector';

const ServiceFormModal = ({
    show,
    isEditMode,
    serviceForm,
    setServiceForm,
    categories,
    onSave,
    onClose
}) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm" onClick={onClose} />
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all">
                    <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-t-2xl p-6">
                        <h2 className="text-2xl font-bold">
                            {isEditMode ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}
                        </h2>
                        <p className="text-blue-100 mt-1">
                            {isEditMode ? 'Cập nhật thông tin dịch vụ' : 'Điền thông tin để tạo dịch vụ mới'}
                        </p>
                    </div>

                    <div className="p-6 space-y-4">
                        {/* Service Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Tên dịch vụ <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={serviceForm.service_name}
                                onChange={(e) => setServiceForm({ ...serviceForm, service_name: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="Khám tổng quát"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Mô tả
                            </label>
                            <textarea
                                value={serviceForm.description}
                                onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                                placeholder="Mô tả chi tiết về dịch vụ"
                            />
                        </div>

                        {/* Icon */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Icon
                            </label>
                            <input
                                type="text"
                                value={serviceForm.icon || ''}
                                onChange={(e) => setServiceForm({ ...serviceForm, icon: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="icon-dental-service"
                            />
                            <p className="text-xs text-gray-500 mt-1">Tên class hoặc URL của icon</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {/* Status */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Trạng thái <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={serviceForm.status}
                                    onChange={(e) => setServiceForm({ ...serviceForm, status: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                                >
                                    <option value="AVAILABLE">Hoạt động (AVAILABLE)</option>
                                    <option value="UNAVAILABLE">Ngừng hoạt động (UNAVAILABLE)</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Price */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Giá dịch vụ (VNĐ) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={serviceForm.price}
                                    onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="100000"
                                    min="0"
                                />
                            </div>

                            {/* Duration */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Thời gian (phút) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={serviceForm.duration}
                                    onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="30"
                                    min="0"
                                />
                            </div>
                        </div>

                        {/* Equipment Service Selector */}
                        <EquipmentServiceSelector
                            equipmentServices={serviceForm.equipment_service || []}
                            setEquipmentServices={(equipments) => setServiceForm({ ...serviceForm, equipment_service: equipments })}
                        />
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
                            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
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
