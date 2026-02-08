import React from 'react';
import { Trash2, X } from 'lucide-react';

const ConfirmationModal = ({
    show,
    onClose,
    onConfirm,
    title = 'Xác nhận xóa',
    message = 'Bạn có chắc chắn muốn xóa mục này? Hành động này không thể hoàn tác.',
    isLoading = false
}) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm transform scale-100 animate-scale-in overflow-hidden">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="p-8 text-center">
                    {/* Icon */}
                    <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 text-red-500 mb-6">
                        <Trash2 size={32} />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {title}
                    </h3>
                    <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                        {message}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors focus:ring-2 focus:ring-red-200 focus:outline-none"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors shadow-lg shadow-red-200 focus:ring-2 focus:ring-red-300 focus:outline-none flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Đang xóa...</span>
                                </>
                            ) : (
                                <span>Xóa</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
