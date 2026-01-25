import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

const ConfirmationModal = ({
    show,
    title = 'Xác nhận xóa',
    message = 'Bạn có chắc chắn muốn xóa mục này? Hành động này không thể hoàn tác.',
    onClose,
    onConfirm,
    confirmText = 'Xóa',
    confirmButtonClass = 'bg-red-600 hover:bg-red-700'
}) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm" onClick={onClose} />
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all scale-100 opacity-100">
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="p-6 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6">
                            <AlertTriangle className="h-8 w-8 text-red-600" />
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {title}
                        </h3>

                        <p className="text-gray-500 mb-8 leading-relaxed">
                            {message}
                        </p>

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 bg-white text-gray-700 font-medium rounded-xl border border-gray-300 hover:bg-gray-50 transition-all duration-200"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={onConfirm}
                                className={`px-5 py-2.5 text-white font-medium rounded-xl shadow-lg transition-all duration-200 flex items-center gap-2 ${confirmButtonClass}`}
                            >
                                <Trash2 size={18} />
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
