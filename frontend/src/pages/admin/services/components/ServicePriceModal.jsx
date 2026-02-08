import React from 'react';

const ServicePriceModal = ({
    show,
    selectedService,
    priceForm,
    setPriceForm,
    formatCurrency,
    onSave,
    onClose
}) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm" onClick={onClose} />
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
                    <div className="relative bg-gradient-to-br from-green-600 to-teal-700 text-white rounded-t-2xl p-6">
                        <h2 className="text-2xl font-bold">Cập nhật giá dịch vụ</h2>
                        <p className="text-green-100 mt-1">{selectedService?.service_name}</p>
                    </div>

                    <div className="p-6">
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">Giá hiện tại:</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(selectedService?.base_price || 0)}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Giá mới (VNĐ) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={priceForm.base_price}
                                onChange={(e) => setPriceForm({ base_price: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                placeholder="100000"
                                min="0"
                            />
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
                            className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-teal-600 text-white font-medium rounded-xl hover:from-green-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl"
                        >
                            Cập nhật giá
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServicePriceModal;
