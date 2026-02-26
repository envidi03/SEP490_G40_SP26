import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Xác nhận',
    confirmColor = 'red',
    icon = 'warning'
}) => {
    if (!isOpen) return null;

    const colorClasses = {
        red: {
            bg: 'bg-red-100',
            text: 'text-red-600',
            button: 'bg-red-600 hover:bg-red-700'
        },
        yellow: {
            bg: 'bg-yellow-100',
            text: 'text-yellow-600',
            button: 'bg-yellow-600 hover:bg-yellow-700'
        },
        green: {
            bg: 'bg-green-100',
            text: 'text-green-600',
            button: 'bg-green-600 hover:bg-green-700'
        }
    };

    const colors = colorClasses[confirmColor] || colorClasses.red;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="flex gap-4">
                        {icon === 'warning' && (
                            <div className={`flex-shrink-0 w-12 h-12 rounded-full ${colors.bg} flex items-center justify-center`}>
                                <AlertTriangle className={colors.text} size={24} />
                            </div>
                        )}
                        <div className="flex-1">
                            <p className="text-gray-700">{message}</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`px-4 py-2 text-white rounded-lg transition-colors ${colors.button}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
