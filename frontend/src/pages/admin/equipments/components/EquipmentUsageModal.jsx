import React from 'react';
import { X, History, Calendar } from 'lucide-react';

const EquipmentUsageModal = ({
    show,
    equipment,
    usageHistory,
    onClose,
    formatDate
}) => {
    if (!show || !equipment) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm" onClick={onClose} />
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all">
                    {/* Header */}
                    <div className="relative bg-gradient-to-br from-purple-600 to-pink-700 text-white rounded-t-2xl p-6">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-bold pr-8">Lịch sử sử dụng</h2>
                        <p className="text-purple-100 mt-1">{equipment.equipment_name}</p>
                    </div>

                    {/* Body */}
                    <div className="p-6 max-h-96 overflow-y-auto">
                        {usageHistory.length === 0 ? (
                            <div className="text-center py-8">
                                <History size={48} className="text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-600">Chưa có lịch sử sử dụng</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {usageHistory.map(usage => (
                                    <div key={usage.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="font-semibold text-gray-900">{usage.userName}</p>
                                                <p className="text-sm text-gray-600">{usage.purpose}</p>
                                            </div>
                                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                                {usage.duration} phút
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Calendar size={12} />
                                            {formatDate(usage.used_date)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EquipmentUsageModal;
