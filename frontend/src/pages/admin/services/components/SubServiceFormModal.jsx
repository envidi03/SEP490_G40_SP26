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

const SubServiceFormModal = ({ show, isEditMode, formData, setFormData, onSave, onClose, loading, error, errors = {}, setErrors }) => {
    if (!show) return null;

    const handleInputChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            const newErrors = { ...errors };
            delete newErrors[field];
            setErrors(newErrors);
        }
    };

    const ErrorMessage = ({ message }) => (
        <p className="text-red-500 text-[11px] mt-1 font-semibold flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
            <span className="w-1 h-1 rounded-full bg-red-500" />
            {message}
        </p>
    );

    return (
        <div className="fixed inset-0 z-[60] overflow-y-auto font-sans">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="flex min-h-full items-center justify-center p-6">
                <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-5xl z-10 text-gray-800 transform transition-all overflow-hidden border border-gray-100">
                    {/* Header with improved styling */}
                    <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 text-white p-7 flex justify-between items-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black tracking-tight">
                                {isEditMode ? 'Cập nhật gói dịch vụ' : 'Thêm gói dịch vụ mới'}
                            </h3>
                            <p className="text-indigo-100/90 text-sm mt-1 font-medium italic">
                                {isEditMode ? 'Thay đổi thông tin chi tiết và giá cả' : 'Cung cấp thông tin để tạo lựa chọn mới cho khách hàng'}
                            </p>
                        </div>
                        <button onClick={onClose} className="text-white hover:bg-white/20 transition-all p-2.5 rounded-2xl border border-white/20 backdrop-blur-sm group select-none relative z-10">
                            <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </div>

                    {/* Body - Horizontal Content Layout */}
                    <div className="p-10 max-h-[75vh] overflow-y-auto custom-scrollbar">
                        {/* Summary error (e.g. server error) if it's not a field-specific validation error */}
                        {error && !Object.keys(errors).length && (
                            <div className="mb-8 flex items-center gap-4 p-5 bg-red-50 border border-red-100 rounded-[1.25rem] text-red-700 animate-in zoom-in-95 duration-300">
                                <div className="bg-red-500 text-white p-1.5 rounded-lg shadow-sm">
                                    <AlertTriangle size={18} />
                                </div>
                                <p className="font-bold text-sm">{error}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                            {/* Left Column: Identify & Logic */}
                            <div className="space-y-8">
                                {/* Tên gói dịch vụ */}
                                <div>
                                    <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-[0.15em] ml-1">
                                        Tên gói dịch vụ <span className="text-indigo-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.sub_service_name}
                                        onChange={(e) => handleInputChange('sub_service_name', e.target.value)}
                                        className={`w-full px-5 py-4 border rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all shadow-sm text-base font-semibold ${
                                            errors.sub_service_name ? 'border-red-400 bg-red-50 text-red-900 focus:ring-red-100' : 'border-gray-200 bg-white placeholder-gray-300'
                                        }`}
                                        placeholder="Ví dụ: Nhổ răng khôn mức 1"
                                    />
                                    {errors.sub_service_name && <ErrorMessage message={errors.sub_service_name} />}
                                </div>

                                {/* Thời gian & Trạng thái */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-[0.15em] ml-1">
                                            Thời gian (phút) <span className="text-indigo-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.duration}
                                            onChange={(e) => handleInputChange('duration', e.target.value)}
                                            className={`w-full px-5 py-4 border rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all shadow-sm font-bold ${
                                                errors.duration ? 'border-red-400 bg-red-50 text-red-900' : 'border-gray-200 bg-white'
                                            }`}
                                            placeholder="30"
                                            min="0"
                                        />
                                        {errors.duration && <ErrorMessage message={errors.duration} />}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-[0.15em] ml-1">
                                            Trạng thái
                                        </label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => handleInputChange('status', e.target.value)}
                                            className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none bg-white font-bold transition-all shadow-sm cursor-pointer appearance-none"
                                        >
                                            <option value="AVAILABLE">Hoạt động (Sẵn sàng)</option>
                                            <option value="UNAVAILABLE">Tạm ngưng (Chờ)</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Mô tả */}
                                <div>
                                    <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-[0.15em] ml-1">Mô tả chi tiết gói</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        rows={6}
                                        className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all resize-none shadow-sm text-sm font-medium leading-relaxed placeholder-gray-300"
                                        placeholder="Nhập mô tả cụ thể về gói dịch vụ này để khách hàng và bác sĩ dễ dàng nắm bắt..."
                                    />
                                </div>
                            </div>

                            {/* Right Column: Media & Finance */}
                            <div className="space-y-8">
                                {/* Multi Image Uploader */}
                                <div className="bg-gray-50/70 p-6 rounded-3xl border border-dashed border-gray-200">
                                    <MultiImageUploader
                                        images={formData.images || []}
                                        onChange={(newImages) => handleInputChange('images', newImages)}
                                        maxImages={5}
                                        label="Thư viện hình ảnh (Gợi ý: 3-5 ảnh)"
                                    />
                                </div>

                                {/* Tài chính */}
                                <div className="space-y-6 bg-indigo-50/30 p-8 rounded-3xl border border-indigo-100/50">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-black text-indigo-400 mb-2 uppercase tracking-[0.15em]">
                                                Giá thấp nhất <span className="text-red-400">*</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={formData.min_price}
                                                    onChange={(e) => handleInputChange('min_price', e.target.value)}
                                                    className={`w-full pl-5 pr-12 py-4 border rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-sm font-bold text-lg ${
                                                        errors.min_price ? 'border-red-400 bg-red-50 text-red-900' : 'border-gray-200 bg-white'
                                                    }`}
                                                    placeholder="500,000"
                                                    min="0"
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-black">VNĐ</span>
                                            </div>
                                            {errors.min_price && <ErrorMessage message={errors.min_price} />}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-indigo-400 mb-2 uppercase tracking-[0.15em]">
                                                Giá cao nhất
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={formData.max_price || ''}
                                                    onChange={(e) => handleInputChange('max_price', e.target.value)}
                                                    className="w-full pl-5 pr-12 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-sm font-bold text-lg bg-white placeholder-gray-300"
                                                    placeholder="Linh hoạt"
                                                    min="0"
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-black">VNĐ</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-indigo-400/80 italic font-bold">
                                        * Lưu ý: Nếu bỏ trống "Giá cao nhất", hệ thống sẽ coi đây là một Gói giá cố định bằng Giá thấp nhất.
                                    </p>
                                </div>

                                {/* Ghi chú nội bộ */}
                                <div>
                                    <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-[0.15em] ml-1">Lưu ý nội bộ / Ghi chú</label>
                                    <input
                                        type="text"
                                        value={formData.note}
                                        onChange={(e) => handleInputChange('note', e.target.value)}
                                        className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-sm font-medium text-sm bg-white"
                                        placeholder="Ví dụ: Chỉ áp dụng cho bệnh nhân trên 18 tuổi..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer với Button hiện đại */}
                    <div className="bg-gray-50/80 px-10 py-6 rounded-b-2xl flex gap-4 justify-end border-t border-gray-100">
                        <button
                            onClick={onClose}
                            className="px-8 py-3 text-gray-500 font-bold rounded-2xl hover:bg-gray-200 hover:text-gray-800 transition-all text-sm select-none"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            onClick={onSave}
                            disabled={loading}
                            className="px-10 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-bold rounded-2xl hover:shadow-xl hover:shadow-indigo-500/30 hover:opacity-90 active:scale-95 transition-all shadow-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 select-none"
                        >
                            {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            <span>{loading ? 'Đang thực hiện...' : (isEditMode ? 'Cập nhật ngay' : 'Xác nhận thêm')}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export { EMPTY_FORM };
export default SubServiceFormModal;
