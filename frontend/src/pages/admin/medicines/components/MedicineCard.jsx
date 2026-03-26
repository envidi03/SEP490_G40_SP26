import React from 'react';
import { Edit2, Trash2, Calendar, AlertTriangle, TrendingDown } from 'lucide-react';
import { formatDate } from '../../../../utils/dateUtils';

const MedicineCard = ({
    medicine,
    isExpiringSoon,
    isExpired,
    getDaysUntilExpiry,
    getStatusColor,
    getStatusText,
    formatCurrency
}) => {
    const expiringSoon = isExpiringSoon(medicine.expiry_date);
    const expired = isExpired(medicine.expiry_date);
    const daysLeft = getDaysUntilExpiry(medicine.expiry_date);
    const lowStock = medicine.quantity < 50;

    return (
        <div
            className={`bg-white rounded-2xl shadow-lg border overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group ${expired ? 'border-red-300' : expiringSoon ? 'border-yellow-300' : 'border-gray-100'
                }`}
        >
            {/* Header */}
            <div className={`relative text-white p-6 ${expired ? 'bg-gradient-to-br from-red-600 to-pink-700' :
                expiringSoon ? 'bg-gradient-to-br from-yellow-600 to-orange-700' :
                    'bg-gradient-to-br from-blue-600 to-indigo-700'
                }`}>
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <p className="text-xs opacity-90 mb-1">{medicine.category}</p>
                        <h3 className="text-lg font-bold mb-1">
                            {medicine.medicine_name}
                        </h3>
                        <p className="text-sm opacity-90">{medicine.dosage}</p>
                    </div>
                    {(expiringSoon || expired) && (
                        <AlertTriangle size={24} />
                    )}
                </div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(medicine.status)}`}>
                    {getStatusText(medicine.status)}
                </span>
            </div>

            {/* Body */}
            <div className="p-6 space-y-3">
                {/* Expiry Warning */}
                {(expiringSoon || expired) && (
                    <div className={`p-3 rounded-lg ${expired ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                        <div className="flex items-center gap-2">
                            <AlertTriangle size={16} className={expired ? 'text-red-600' : 'text-yellow-600'} />
                            <p className={`text-sm font-bold ${expired ? 'text-red-700' : 'text-yellow-700'}`}>
                                {expired ? 'ĐÃ HẾT HẠN' : `Hết hạn trong ${daysLeft} ngày`}
                            </p>
                        </div>
                    </div>
                )}

                {/* Manufacturer */}
                <div>
                    <p className="text-xs text-gray-500 mb-1">Nhà sản xuất</p>
                    <p className="text-sm font-semibold text-gray-900">{medicine.manufacturer}</p>
                </div>

                {/* Stock */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Số lượng tồn</p>
                        <p className={`text-lg font-bold ${lowStock ? 'text-orange-600' : 'text-gray-900'}`}>
                            {medicine.quantity} {medicine.unit}
                        </p>
                    </div>
                    {lowStock && (
                        <div className="flex items-center gap-1 text-orange-600 text-xs font-medium">
                            <TrendingDown size={14} />
                            <span>Sắp hết</span>
                        </div>
                    )}
                </div>

                {/* Expiry Date */}
                <div>
                    <p className="text-xs text-gray-500 mb-1">Hạn sử dụng</p>
                    <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        <p className="text-sm font-medium text-gray-900">
                            {formatDate(medicine.expiry_date)}
                        </p>
                    </div>
                </div>

                {/* Price */}
                <div>
                    <p className="text-xs text-gray-500 mb-1">Đơn giá</p>
                    <p className="text-lg font-bold text-green-600">
                        {formatCurrency(medicine.price)}
                    </p>
                </div>

                {/* Batch Number */}
                <div>
                    <p className="text-xs text-gray-500 mb-1">Số lô</p>
                    <p className="text-sm font-mono text-gray-900">{medicine.batch_number}</p>
                </div>

            </div>
        </div>
    );
};

export default MedicineCard;
