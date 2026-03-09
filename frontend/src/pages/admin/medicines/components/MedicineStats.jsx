import React from 'react';
import { Pill, AlertTriangle, TrendingDown, DollarSign } from 'lucide-react';

const MedicineStats = ({ totalMedicines, expiringSoon, lowStock }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <Pill className="text-white" size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600">Tổng loại thuốc</p>
                        <p className="text-3xl font-bold text-blue-600">{totalMedicines}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg">
                        <AlertTriangle className="text-white" size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600">Sắp hết hạn</p>
                        <p className="text-3xl font-bold text-yellow-600">{expiringSoon}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                        <TrendingDown className="text-white" size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600">Sắp hết hàng</p>
                        <p className="text-3xl font-bold text-orange-600">{lowStock}</p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default MedicineStats;
