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
                        <div className="grid grid-cols-1 gap-4">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                                <p className="text-sm text-gray-500 mb-1 flex items-center justify-center gap-2">
                                    <DollarSign size={14} /> Giá dịch vụ
                                </p>
                                <p className="text-base font-bold text-green-600">
                                    {service.calculated_min_price === service.calculated_max_price
                                        ? formatCurrency(service.calculated_min_price)
                                        : `${formatCurrency(service.calculated_min_price)} - ${formatCurrency(service.calculated_max_price)}`
                                    }
                                </p>
                                {service.sub_service_count > 0 && service.calculated_min_price !== service.calculated_max_price && (
                                    <p className="text-[10px] text-gray-400 font-medium uppercase mt-1">
                                        (Chỉ từ {formatCurrency(service.calculated_min_price)})
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Mô tả chi tiết</h3>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-gray-700 leading-relaxed min-h-[100px]">
                                {service.description || 'Chưa có mô tả cho dịch vụ này.'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceDetailModal;
