import React from 'react';
import { Pill } from 'lucide-react';
import MedicineCard from './MedicineCard';

const MedicineGrid = ({
    medicines,
    isExpiringSoon,
    isExpired,
    getDaysUntilExpiry,
    getStatusColor,
    getStatusText,
    formatCurrency,
    searchTerm,
    statusFilter
}) => {
    if (medicines.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
                <Pill className="text-gray-300 mx-auto mb-4" size={64} />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Không tìm thấy thuốc
                </h3>
                <p className="text-gray-600">
                    {searchTerm || statusFilter !== 'all'
                        ? 'Không có thuốc nào phù hợp với bộ lọc của bạn'
                        : 'Chưa có thuốc nào trong hệ thống'}
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {medicines.map(medicine => (
                <MedicineCard
                    key={medicine._id || medicine.id}
                    medicine={medicine}
                    isExpiringSoon={isExpiringSoon}
                    isExpired={isExpired}
                    getDaysUntilExpiry={getDaysUntilExpiry}
                    getStatusColor={getStatusColor}
                    getStatusText={getStatusText}
                    formatCurrency={formatCurrency}
                />
            ))}
        </div>
    );
};

export default MedicineGrid;
