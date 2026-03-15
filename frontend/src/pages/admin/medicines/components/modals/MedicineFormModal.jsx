import React from 'react';

const MedicineFormModal = ({
    show,
    onClose,
    isEditMode,
    medicineForm,
    setMedicineForm,
    onSave
}) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
            <div
                className="fixed inset-0 bg-black/50 transition-opacity backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform scale-100 animate-scale-in max-h-[90vh] flex flex-col">
                    {/* Header */}
                    <div className="shrink-0 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-t-2xl p-6 z-10">
                        <h2 className="text-2xl font-bold">
                            {isEditMode ? 'Chỉnh sửa thuốc' : 'Thêm thuốc mới'}
                        </h2>
                        <p className="text-blue-100 mt-1">
                            {isEditMode ? 'Cập nhật thông tin thuốc' : 'Điền thông tin để thêm thuốc mới'}
                        </p>
                    </div>

                    {/* Scrollable Body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Tên thuốc <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={medicineForm.medicine_name}
                                onChange={(e) => setMedicineForm({ ...medicineForm, medicine_name: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="Paracetamol 500mg"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Loại thuốc
                                </label>
                                <input
                                    type="text"
                                    value={medicineForm.medicine_type}
                                    onChange={(e) => setMedicineForm({ ...medicineForm, medicine_type: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Giảm đau, hạ sốt"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Liều lượng
                                </label>
                                <input
                                    type="text"
                                    value={medicineForm.dosage}
                                    onChange={(e) => setMedicineForm({ ...medicineForm, dosage: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="500mg"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nhà sản xuất
                            </label>
                            <input
                                type="text"
                                value={medicineForm.manufacturer}
                                onChange={(e) => setMedicineForm({ ...medicineForm, manufacturer: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="DHG Pharma"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Số lượng <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={medicineForm.quantity}
                                    onChange={(e) => setMedicineForm({ ...medicineForm, quantity: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="500"
                                    min="0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Đơn vị
                                </label>
                                <select
                                    value={medicineForm.unit}
                                    onChange={(e) => setMedicineForm({ ...medicineForm, unit: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                                >
                                    <option value="Viên">Viên</option>
                                    <option value="Chai">Chai</option>
                                    <option value="Lọ">Lọ</option>
                                    <option value="Tuýp">Tuýp</option>
                                    <option value="Bộ">Bộ</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Đơn giá (VNĐ)
                                </label>
                                <input
                                    type="number"
                                    value={medicineForm.price}
                                    onChange={(e) => setMedicineForm({ ...medicineForm, price: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="500"
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Hạn sử dụng <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={medicineForm.expiry_date}
                                    onChange={(e) => setMedicineForm({ ...medicineForm, expiry_date: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Số lô
                                </label>
                                <input
                                    type="text"
                                    value={medicineForm.batch_number}
                                    onChange={(e) => setMedicineForm({ ...medicineForm, batch_number: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="PCT-2024-001"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Trạng thái <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={medicineForm.status}
                                onChange={(e) => setMedicineForm({ ...medicineForm, status: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                            >
                                <option value="AVAILABLE">Còn hàng</option>
                                <option value="EXPIRING_SOON">Sắp hết hạn</option>
                                <option value="LOW_STOCK">Sắp hết</option>
                                <option value="OUT_OF_STOCK">Hết hàng</option>
                            </select>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="shrink-0 bg-gray-50 border-t border-gray-100 px-6 py-4 rounded-b-2xl flex gap-3 justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 text-gray-700 font-medium rounded-xl hover:bg-gray-200 focus:ring-2 focus:ring-gray-300 outline-none transition-all"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={onSave}
                            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 outline-none shadow-lg hover:shadow-xl transition-all"
                        >
                            {isEditMode ? 'Cập nhật' : 'Thêm thuốc'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MedicineFormModal;
