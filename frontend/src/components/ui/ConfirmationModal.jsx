import React from 'react';
import { Trash2, X } from 'lucide-react';

const ConfirmationModal = ({
    show,
    onClose,
    onConfirm,
    title = 'Xác nhận xóa',
    message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
    isLoading = false,
    icon: CustomIcon,
    iconBgClass = 'bg-red-50 text-red-500',
    confirmBtnClass = 'bg-red-500 text-white hover:bg-red-600 shadow-red-200 focus:ring-red-300',
    cancelBtnClass = 'border-red-200 text-red-600 hover:bg-red-50 focus:ring-red-200',
    confirmText = 'Xóa',
    loadingText = 'Đang xử lý...'
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
                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 ${iconBgClass}`}>
                        {CustomIcon ? <CustomIcon size={32} /> : <Trash2 size={32} />}
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
                            className={`flex-1 px-4 py-2.5 border rounded-xl font-medium transition-colors focus:ring-2 focus:outline-none ${cancelBtnClass}`}
                        >
                            Hủy
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-colors shadow-lg focus:ring-2 focus:outline-none flex items-center justify-center gap-2 ${confirmBtnClass}`}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>{loadingText}</span>
                                </>
                            ) : (
                                <span>{confirmText}</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
