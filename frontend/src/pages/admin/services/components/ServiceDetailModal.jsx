import React from 'react';
import { X, Clock, DollarSign, Tag, CheckCircle, XCircle } from 'lucide-react';

const ServiceDetailModal = ({ show, service, onClose, formatCurrency, getCategoryColor }) => {
    if (!show || !service) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm" onClick={onClose} />
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all">
                    {/* Header */}
                    <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-t-2xl p-6">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>
                        <div className="pr-8">
                            <h2 className="text-2xl font-bold">
                                {service.service_name}
                            </h2>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6">
                        {/* Key Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                                    <DollarSign size={14} /> Giá dịch vụ
                                </p>
                                <p className="text-xl font-bold text-green-600">
                                    {formatCurrency(service.price)}
                                </p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                                    <Clock size={14} /> Thời gian
                                </p>
                                <p className="text-xl font-bold text-gray-800">
                                    {service.duration} phút
                                </p>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Mô tả chi tiết</h3>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-gray-700 leading-relaxed min-h-[100px]">
                                {service.description || 'Chưa có mô tả cho dịch vụ này.'}
                            </div>
                        </div>

                        {/* Status */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <span className="text-gray-600 font-medium">Trạng thái</span>
                            {service.status === 'AVAILABLE' ? (
                                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                                    <CheckCircle size={16} />
                                    <span className="text-sm font-semibold">Đang hoạt động</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1.5 rounded-full">
                                    <XCircle size={16} />
                                    <span className="text-sm font-semibold">Ngừng hoạt động</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceDetailModal;
