import React from 'react';
import { DollarSign, Clock, CheckCircle, XCircle, Eye, Edit2, Trash2 } from 'lucide-react';

const ServiceCard = ({
    service,
    onViewDetails,
    onEdit,
    onDelete,
    onUpdatePrice,
    formatCurrency,
    getCategoryColor
}) => {
    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6">
                <h3 className="text-xl font-bold mb-2">
                    {service.service_name}
                </h3>
                <p className="text-blue-100 text-sm line-clamp-2">
                    {service.description}
                </p>
            </div>

            {/* Body */}
            <div className="p-6">
                {/* Price */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
                            <DollarSign size={16} className="text-green-600" />
                            Giá dịch vụ
                        </span>
                        <button
                            onClick={() => onUpdatePrice(service)}
                            className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                        >
                            Cập nhật
                        </button>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(service.price)}
                    </p>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <Clock size={16} className="text-orange-600" />
                    <span className="text-sm">
                        Thời gian: <span className="font-semibold">{service.duration} phút</span>
                    </span>
                </div>

                {/* Equipment Count */}
                {service.equipment_service && service.equipment_service.length > 0 && (
                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                        <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        </svg>
                        <span className="text-sm">
                            Thiết bị: <span className="font-semibold">{service.equipment_service.length}</span>
                        </span>
                    </div>
                )}

                {/* Status */}
                <div className="flex items-center gap-2 mb-4">
                    {service.status === 'AVAILABLE' ? (
                        <>
                            <CheckCircle size={16} className="text-green-600" />
                            <span className="text-sm text-green-600 font-medium">Đang hoạt động</span>
                        </>
                    ) : (
                        <>
                            <XCircle size={16} className="text-red-600" />
                            <span className="text-sm text-red-600 font-medium">Ngừng hoạt động</span>
                        </>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <button
                        onClick={() => onViewDetails(service)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 font-medium rounded-xl hover:bg-blue-100 transition-all duration-200"
                        title="Xem chi tiết"
                    >
                        <Eye size={16} />
                    </button>
                    <button
                        onClick={() => onEdit(service)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-600 font-medium rounded-xl hover:bg-green-100 transition-all duration-200"
                    >
                        <Edit2 size={16} />
                        <span>Sửa</span>
                    </button>
                    <button
                        onClick={() => onDelete(service._id)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-all duration-200"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ServiceCard;
