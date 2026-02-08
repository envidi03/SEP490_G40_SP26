import React from 'react';
import { ClipboardList, CheckCircle, TrendingUp } from 'lucide-react';

const ServiceStatistics = ({ totalServices, activeServices, avgPrice, formatCurrency }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <ClipboardList className="text-white" size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600">Tổng dịch vụ</p>
                        <p className="text-3xl font-bold text-blue-600">{totalServices}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center shadow-lg">
                        <CheckCircle className="text-white" size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                        <p className="text-3xl font-bold text-green-600">{activeServices}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                        <TrendingUp className="text-white" size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600">Giá trung bình</p>
                        <p className="text-2xl font-bold text-purple-600">{formatCurrency(avgPrice)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceStatistics;
