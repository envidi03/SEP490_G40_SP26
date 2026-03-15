import React from 'react';
import { DollarSign, Clock, CheckCircle, XCircle, Eye, Edit2, LayoutList } from 'lucide-react';

const ServiceCard = ({
    service,
    onViewDetails,
    onEdit,
    onUpdatePrice,
    onManageSubServices,
    formatCurrency,
    getCategoryColor
}) => {
    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
            {/* Header */}
            <div className="relative text-white">
                {service.icon ? (
                    <div className="relative h-44 overflow-hidden">
                        <img
                            src={service.icon}
                            alt={service.service_name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="text-xl font-bold mb-1 drop-shadow">
                                {service.service_name}
                            </h3>
                            <p className="text-white/80 text-sm line-clamp-2 drop-shadow">
                                {service.description}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6">
                        <h3 className="text-xl font-bold mb-2">
                            {service.service_name}
                        </h3>
                        <p className="text-blue-100 text-sm line-clamp-2">
                            {service.description}
                        </p>
                    </div>
                )}
            </div>

            {/* Body */}
            <div className="p-6">
                {/* Price Range */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
                            <DollarSign size={16} className="text-green-600" />
                            Giá dịch vụ
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <p className="text-base font-bold text-green-600">
                            {service.calculated_min_price === service.calculated_max_price
                                ? formatCurrency(service.calculated_min_price)
                                : `${formatCurrency(service.calculated_min_price)} - ${formatCurrency(service.calculated_max_price)}`
                            }
                        </p>
                        {service.sub_service_count > 0 && service.calculated_min_price !== service.calculated_max_price && (
                            <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">
                                (Chỉ từ {formatCurrency(service.calculated_min_price)})
                            </span>
                        )}
                    </div>
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

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <button
                        onClick={() => onViewDetails(service)}
                        className="inline-flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-50 text-blue-600 font-medium rounded-xl hover:bg-blue-100 transition-all duration-200"
                        title="Xem chi tiết"
                    >
                        <Eye size={16} />
                    </button>
                    <button
                        onClick={() => onEdit(service)}
                        className="inline-flex items-center justify-center gap-2 px-3 py-2.5 bg-green-50 text-green-600 font-medium rounded-xl hover:bg-green-100 transition-all duration-200"
                        title="Sửa dịch vụ"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => onManageSubServices(service)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 bg-indigo-50 text-indigo-700 font-medium rounded-xl hover:bg-indigo-100 transition-all duration-200 text-sm"
                        title="Quản lý gói dịch vụ"
                    >
                        <LayoutList size={15} />
                        <span>Gói dịch vụ</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ServiceCard;
