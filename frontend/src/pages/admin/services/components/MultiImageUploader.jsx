import React, { useRef, useState } from 'react';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import serviceService from '../../../../services/serviceService';

/**
 * MultiImageUploader - Component upload nhiều ảnh dùng chung
 * 
 * @param {string[]} images - Mảng URL ảnh hiện tại
 * @param {function} onChange - Callback khi danh sách ảnh thay đổi: onChange(newImages)
 * @param {number} maxImages - Số ảnh tối đa cho phép (default: 10)
 * @param {string} label - Nhãn hiển thị (default: "Ảnh dịch vụ")
 */
const MultiImageUploader = ({ images = [], onChange, maxImages = 10, label = 'Ảnh dịch vụ' }) => {
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        await uploadFiles(files);
        // Reset input để có thể chọn lại cùng file
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files || []);
        if (files.length === 0) return;
        await uploadFiles(files);
    };

    const uploadFiles = async (files) => {
        const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        const MAX_FILE_SIZE_MB = 10;

        // Validate từng file trước khi upload
        for (const file of files) {
            if (!ALLOWED_TYPES.includes(file.type)) {
                setUploadError(`Định dạng file không được hỗ trợ! Chỉ chấp nhận PNG, JPG, WebP, GIF.`);
                return;
            }
            if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                setUploadError(`File "${file.name}" vượt quá giới hạn ${MAX_FILE_SIZE_MB}MB.`);
                return;
            }
        }

        const remaining = maxImages - images.length;
        if (remaining <= 0) {
            setUploadError(`Đã đạt giới hạn ${maxImages} ảnh tối đa.`);
            return;
        }

        const filesToUpload = files.slice(0, remaining);
        setUploadError('');
        setUploading(true);

        try {
            let newUrls = [];
            if (filesToUpload.length === 1) {
                // Upload 1 ảnh dùng endpoint cũ
                const url = await serviceService.uploadImage(filesToUpload[0]);
                newUrls = [url];
            } else {
                // Upload nhiều ảnh
                newUrls = await serviceService.uploadImages(filesToUpload);
            }
            onChange([...images, ...newUrls]);
        } catch (err) {
            setUploadError(err?.data?.message || err?.message || 'Upload ảnh thất bại!');
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = (index) => {
        const updated = images.filter((_, i) => i !== index);
        onChange(updated);
    };

    const canAddMore = images.length < maxImages;

    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
                {label}
                <span className="text-gray-400 font-normal ml-2">
                    ({images.length}/{maxImages} ảnh)
                </span>
            </label>

            {/* Grid ảnh đã upload */}
            {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                    {images.map((url, index) => (
                        <div key={index} className="relative group aspect-square">
                            <img
                                src={url}
                                alt={`Ảnh ${index + 1}`}
                                className="w-full h-full object-cover rounded-xl border border-gray-200 shadow-sm"
                            />
                            {/* Badge ảnh đầu tiên là ảnh đại diện */}
                            {index === 0 && (
                                <span className="absolute top-1 left-1 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow">
                                    Chính
                                </span>
                            )}
                            {/* Nút xóa */}
                            <button
                                type="button"
                                onClick={() => handleRemove(index)}
                                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Xóa ảnh"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}

                    {/* Ô thêm ảnh mới (nếu chưa đạt giới hạn) */}
                    {canAddMore && !uploading && (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square rounded-xl border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50 hover:bg-blue-100 flex flex-col items-center justify-center gap-1 transition-all"
                        >
                            <ImagePlus size={20} className="text-blue-500" />
                            <span className="text-xs text-blue-600 font-medium">Thêm ảnh</span>
                        </button>
                    )}

                    {/* Ô loading khi upload */}
                    {uploading && (
                        <div className="aspect-square rounded-xl border-2 border-dashed border-blue-300 bg-blue-50 flex flex-col items-center justify-center gap-1">
                            <Loader2 size={20} className="text-blue-500 animate-spin" />
                            <span className="text-xs text-blue-600">Đang tải...</span>
                        </div>
                    )}
                </div>
            )}

            {/* Drop zone chính (khi chưa có ảnh nào) */}
            {images.length === 0 && (
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
                                <p className="text-xs text-gray-500 mt-1">
                                    PNG, JPG, WebP — tối đa {maxImages} ảnh, mỗi ảnh tối đa 10MB
                                </p>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Drop zone phụ khi đã có ảnh nhưng còn slot */}
            {images.length > 0 && canAddMore && !uploading && (
                <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="mt-2 w-full border border-dashed border-gray-300 rounded-xl py-2 text-center text-xs text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-all"
                >
                    Kéo thả thêm ảnh vào đây
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={handleFileSelect}
                className="hidden"
            />

            {uploadError && (
                <p className="text-xs text-red-500 mt-2">⚠️ {uploadError}</p>
            )}
        </div>
    );
};

export default MultiImageUploader;
