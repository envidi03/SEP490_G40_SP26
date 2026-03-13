import React, { useState } from 'react';
import { X } from 'lucide-react';
import MultiImageUploader from './MultiImageUploader';

const EMPTY_FORM = {
    sub_service_name: '',
    description: '',
    price: '',
    duration: '',
    note: '',
    status: 'AVAILABLE',
    images: []
};

const SubServiceFormModal = ({ show, isEditMode, formData, setFormData, onSave, onClose, loading }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm" onClick={onClose} />
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-t-2xl p-5 flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold">
                                {isEditMode ? 'Sửa dịch vụ con' : 'Thêm dịch vụ con'}
                            </h3>
                            <p className="text-indigo-200 text-sm mt-0.5">
                                {isEditMode ? 'Cập nhật thông tin dịch vụ con' : 'Tạo mới dịch vụ con'}
                            </p>
                        </div>
                        <button onClick={onClose} className="text-white/80 hover:text-white">
                            <X size={22} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        {/* Tên dịch vụ con */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Tên dịch vụ con <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.sub_service_name}
                                onChange={(e) => setFormData({ ...formData, sub_service_name: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="VD: Nhổ Răng Khôn"
                            />
                        </div>

                        {/* Mô tả */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Mô tả</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={2}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                placeholder="Mô tả ngắn về dịch vụ"
                            />
                        </div>

                        {/* Multi Image Uploader */}
                        <MultiImageUploader
                            images={formData.images || []}
                            onChange={(newImages) => setFormData({
                                ...formData,
                                images: newImages,
                                icon: newImages.length > 0 ? newImages[0] : (formData.icon || '')
                            })}
                            maxImages={5}
                            label="Hình ảnh dịch vụ con"
                        />

                        {/* Giá + Thời gian */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Giá (VNĐ) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="290000"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Thời gian (phút) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="30"
                                    min="0"
                                />
                            </div>
                        </div>

                        {/* Trạng thái */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Trạng thái</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                            >
                                <option value="AVAILABLE">Hoạt động</option>
                                <option value="UNAVAILABLE">Ngừng hoạt động</option>
                            </select>
                        </div>

                        {/* Ghi chú */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Ghi chú</label>
                            <input
                                type="text"
                                value={formData.note}
                                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Ghi chú thêm (nếu có)"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex gap-3 justify-end">
                        <button
                            onClick={onClose}
                            className="px-5 py-2 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={onSave}
                            disabled={loading}
                            className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-medium rounded-xl hover:opacity-90 transition-all shadow-md disabled:opacity-50"
                        >
                            {loading ? 'Đang lưu...' : (isEditMode ? 'Cập nhật' : 'Thêm mới')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export { EMPTY_FORM };
export default SubServiceFormModal;
