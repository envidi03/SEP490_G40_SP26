import React from 'react';
import { X } from 'lucide-react';

const EquipmentFormModal = ({
    show,
    isEditMode,
    equipmentForm,
    setEquipmentForm,
    onSave,
    onClose
}) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm" onClick={onClose} />
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="sticky top-0 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-t-2xl p-6 z-10">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-bold pr-8">
                            {isEditMode ? 'Chỉnh sửa thiết bị' : 'Thêm thiết bị mới'}
                        </h2>
                        <p className="text-blue-100 mt-1">
                            {isEditMode ? 'Cập nhật thông tin thiết bị' : 'Điền thông tin để tạo thiết bị mới'}
                        </p>
                    </div>

                    {/* Form Body */}
                    <div className="p-6 space-y-4">
                        {/* Equipment Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Tên thiết bị <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={equipmentForm.equipment_name}
                                onChange={(e) => setEquipmentForm({ ...equipmentForm, equipment_name: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="Máy X-quang kỹ thuật số"
                            />
                        </div>

                        {/* Equipment Type & Serial Number */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Loại thiết bị <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={equipmentForm.equipment_type}
                                    onChange={(e) => setEquipmentForm({ ...equipmentForm, equipment_type: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="X-ray"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Số serial
                                </label>
                                <input
                                    type="text"
                                    value={equipmentForm.equipment_serial_number}
                                    onChange={(e) => setEquipmentForm({ ...equipmentForm, equipment_serial_number: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="XR-2024-001"
                                />
                            </div>
                        </div>

                        {/* Purchase Date & Supplier */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Ngày mua
                                </label>
                                <input
                                    type="date"
                                    value={equipmentForm.purchase_date}
                                    onChange={(e) => setEquipmentForm({ ...equipmentForm, purchase_date: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Nhà cung cấp
                                </label>
                                <input
                                    type="text"
                                    value={equipmentForm.supplier}
                                    onChange={(e) => setEquipmentForm({ ...equipmentForm, supplier: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Tên nhà cung cấp"
                                />
                            </div>
                        </div>

                        {/* Warranty */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Hạn bảo hành
                            </label>
                            <input
                                type="date"
                                value={equipmentForm.warranty}
                                onChange={(e) => setEquipmentForm({ ...equipmentForm, warranty: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Trạng thái <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={equipmentForm.status}
                                onChange={(e) => setEquipmentForm({ ...equipmentForm, status: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                            >
                                <option value="READY">Sẵn sàng</option>
                                <option value="IN_USE">Đang sử dụng</option>
                                <option value="MAINTENANCE">Bảo trì</option>
                                <option value="REPAIRING">Đang sửa chữa</option>
                                <option value="FAULTY">Bị hỏng</option>
                                <option value="STERILIZING">Đang khử trùng</option>
                            </select>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl flex gap-3 justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={onSave}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-lg"
                        >
                            {isEditMode ? 'Cập nhật' : 'Thêm mới'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EquipmentFormModal;
