import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import MultiImageUploader from './MultiImageUploader';

const EMPTY_FORM = {
    sub_service_name: '',
    description: '',
    min_price: '',
    max_price: '',
    duration: '',
    note: '',
    status: 'AVAILABLE',
    images: []
};

const SubServiceFormModal = ({ show, isEditMode, formData, setFormData, onSave, onClose, loading, error }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm" onClick={onClose} />
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl z-10 text-gray-800">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-t-2xl p-5 flex justify-between items-center shadow-lg">
                        <div>
                            <h3 className="text-xl font-bold">
                                {isEditMode ? 'Sửa gói dịch vụ' : 'Thêm gói dịch vụ'}
                            </h3>
                            <p className="text-indigo-100/80 text-sm mt-0.5">
                                {isEditMode ? 'Cập nhật thông tin chi tiết' : 'Điền thông tin để tạo gói dịch vụ mới'}
                            </p>
                        </div>
                        <button onClick={onClose} className="text-white/80 hover:text-white transition-colors bg-white/10 p-2 rounded-full">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                        {/* Error Alert in Modal */}
                        {error && (
                            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 animate-in fade-in slide-in-from-top-2 duration-300">
                                <AlertTriangle size={20} className="shrink-0" />
                                <p className="font-bold text-sm tracking-tight">{error}</p>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-6">
                            {/* Tên gói dịch vụ */}
                            <div className="col-span-1">
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                                    Tên gói dịch vụ <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.sub_service_name}
                                    onChange={(e) => setFormData({ ...formData, sub_service_name: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
                                    placeholder="VD: Nhổ Răng Khôn"
                                />
                            </div>

                            {/* Thời gian */}
                            <div className="col-span-1">
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                                    Thời gian (phút) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
                                    placeholder="30"
                                    min="0"
                                />
                            </div>
                        </div>

                        {/* Mô tả - Full width */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Mô tả chi tiết</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={2}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none shadow-sm"
                                placeholder="Mô tả ngắn gọn về đặc điểm của gói dịch vụ này..."
                            />
                        </div>

                        {/* Multi Image Uploader - Full width */}
                        <div className="bg-gray-50/50 p-4 rounded-2xl border border-dashed border-gray-200">
                            <MultiImageUploader
                                images={formData.images || []}
                                onChange={(newImages) => setFormData({
                                    ...formData,
                                    images: newImages,
                                    icon: newImages.length > 0 ? newImages[0] : (formData.icon || '')
                                })}
                                maxImages={5}
                                label="Hình ảnh gói dịch vụ (Tối đa 5 ảnh)"
                            />
                        </div>

                        {/* Giá Min-Max */}
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                                    Giá thấp nhất (VNĐ) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={formData.min_price}
                                        onChange={(e) => setFormData({ ...formData, min_price: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm pr-12"
                                        placeholder="500,000"
                                        min="0"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">VNĐ</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                                    Giá cao nhất (tùy chọn)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={formData.max_price || ''}
                                        onChange={(e) => setFormData({ ...formData, max_price: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm pr-12"
                                        placeholder="Để trống nếu là giá cố định"
                                        min="0"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">VNĐ</span>
                                </div>
                                <p className="text-[11px] text-gray-400 mt-1.5 ml-1 italic font-medium">
                                    *Hệ thống sẽ hiển thị giá cố định nếu bỏ trống ô này
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 pt-2 border-t border-gray-100">
                            {/* Trạng thái */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Trạng thái hoạt động</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-all shadow-sm appearance-none cursor-pointer"
                                >
                                    <option value="AVAILABLE">Sẵn sàng (Available)</option>
                                    <option value="UNAVAILABLE">Tạm ngưng (Unavailable)</option>
                                </select>
                            </div>

                            {/* Ghi chú */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Ghi chú nội bộ</label>
                                <input
                                    type="text"
                                    value={formData.note}
                                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                                    placeholder="Lưu ý cho bác sĩ (nếu có)..."
                                />
                            </div>
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
