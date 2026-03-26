import React from 'react';
import { Clock, CheckCircle } from 'lucide-react';

const InvoiceStats = ({ pendingCount, completedCount }) => {
    return (
        <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Clock size={24} className="text-amber-600" />
                </div>
                <div>
                    <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
                    <p className="text-sm text-gray-500">Chờ thanh toán</p>
                </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle size={24} className="text-green-600" />
                </div>
                <div>
                    <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
                    <p className="text-sm text-gray-500">Đã thanh toán</p>
                </div>
            </div>
        </div>
    );
};

export default InvoiceStats;
