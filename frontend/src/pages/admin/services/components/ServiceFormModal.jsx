import React, { useRef, useState } from 'react';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import EquipmentServiceSelector from './EquipmentServiceSelector';
import apiClient from '../../../../services/api';

const ServiceFormModal = ({
    show,
    isEditMode,
    serviceForm,
    setServiceForm,
    categories,
    onSave,
    onClose
}) => {
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');

    if (!show) return null;

    const handleImageChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await uploadImage(file);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        await uploadImage(file);
    };

    const uploadImage = async (file) => {
        setUploadError('');
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);
            const response = await apiClient.post('/api/service/upload-image', formData, {
                headers: { 'Content-Type': undefined },
                timeout: 30000
            });
            const url = response?.data?.url || response?.url;
            setServiceForm({ ...serviceForm, icon: url });
        } catch (err) {
            setUploadError(err?.data?.message || err?.message || 'Upload ảnh thất bại!');
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = () => {
        setServiceForm({ ...serviceForm, icon: '' });
        setUploadError('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

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

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Ảnh dịch vụ
                            </label>

                            {serviceForm.icon ? (
                                /* Preview */
                                <div className="relative inline-block">
                                    <img
                                        src={serviceForm.icon}
                                        alt="Ảnh dịch vụ"
                                        className="w-full max-h-48 object-cover rounded-xl border border-gray-200 shadow"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow transition-colors"
                                        title="Xóa ảnh"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                /* Drop zone */
                                <div
                                    onClick={() => !uploading && fileInputRef.current?.click()}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleDrop}
                                    className={`w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all
                                        ${uploading
                                            ? 'border-blue-300 bg-blue-50 cursor-wait'
                                            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                                        }`}
                                >
                                    {uploading ? (
                                        <>
                                            <Loader2 size={36} className="text-blue-500 animate-spin" />
                                            <p className="text-sm text-blue-600 font-medium">Đang tải ảnh lên...</p>
                                        </>
                                    ) : (
                                        <>
                                            <ImagePlus size={36} className="text-gray-400" />
                                            <div className="text-center">
                                                <p className="text-sm font-medium text-gray-700">
                                                    Kéo thả ảnh vào đây hoặc{' '}
                                                    <span className="text-blue-600 underline">chọn file</span>
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">PNG, JPG, WebP tối đa 10MB</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                onChange={handleImageChange}
                                className="hidden"
                            />

                            {uploadError && (
                                <p className="text-xs text-red-500 mt-2">⚠️ {uploadError}</p>
                            )}
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
                            disabled={uploading}
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
