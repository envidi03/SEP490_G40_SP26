import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const Toast = ({ type = 'success', message, onClose, duration = 3000 }) => {
    useEffect(() => {
        if (duration && onClose) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const icons = {
        success: <CheckCircle size={20} />,
        error: <XCircle size={20} />,
        info: <Info size={20} />,
        warning: <AlertTriangle size={20} />
    };

    const styles = {
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800'
    };

    const iconStyles = {
        success: 'text-green-600',
        error: 'text-red-600',
        info: 'text-blue-600',
        warning: 'text-yellow-600'
    };

    return (
        <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
            <div className={`${styles[type]} border-l-4 rounded-lg shadow-xl p-4 pr-12 min-w-[300px] max-w-md backdrop-blur-sm`}>
                <div className="flex items-start gap-3">
                    <div className={iconStyles[type]}>
                        {icons[type]}
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-sm">{message}</p>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
                {/* Progress bar */}
                {duration && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden">
                        <div
                            className={`h-full ${type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`}
                            style={{
                                animation: `shrink ${duration}ms linear forwards`
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Toast;
