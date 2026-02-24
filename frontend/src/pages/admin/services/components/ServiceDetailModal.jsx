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
                    <div className="relative rounded-t-2xl overflow-hidden text-white">
                        {service.icon ? (
                            <div className="relative h-56">
                                <img
                                    src={service.icon}
                                    alt={service.service_name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors backdrop-blur-sm"
                                >
                                    <X size={20} />
                                </button>
                                <div className="absolute bottom-0 left-0 right-0 p-5">
                                    <h2 className="text-2xl font-bold drop-shadow">
                                        {service.service_name}
                                    </h2>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6">
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
                        )}
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

                        {/* Equipment Service List */}
                        {service.equipment_service && service.equipment_service.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                    </svg>
                                    Thiết bị cần thiết ({service.equipment_service.length})
                                </h3>
                                <div className="space-y-2">
                                    {service.equipment_service.map((item, index) => (
                                        <div key={index} className="bg-purple-50 border border-purple-100 rounded-lg p-3">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-800">
                                                        {item.equipment_id?.equipment_name || 'Thiết bị không xác định'}
                                                    </p>
                                                    {item.equipment_id?.equipment_type && (
                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                            Loại: {item.equipment_id.equipment_type}
                                                        </p>
                                                    )}
                                                    {item.note && (
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            💡 {item.note}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="ml-3">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-600 text-white">
                                                        x{item.required_qty}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

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
