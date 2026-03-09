import React from 'react';
import { PackageSearch, AlertCircle, Clock, CheckCircle } from 'lucide-react';

const RestockStats = ({ totalRequests, pendingRequests, highPriority, completedRequests }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <PackageSearch className="text-white" size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600">Tổng yêu cầu</p>
                        <p className="text-3xl font-bold text-blue-600">{totalRequests}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg">
                        <Clock className="text-white" size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600">Chờ duyệt</p>
                        <p className="text-3xl font-bold text-yellow-600">{pendingRequests}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
                        <AlertCircle className="text-white" size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600">Ưu tiên cao</p>
                        <p className="text-3xl font-bold text-red-600">{highPriority}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center shadow-lg">
                        <CheckCircle className="text-white" size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600">Đã giải quyết</p>
                        <p className="text-3xl font-bold text-green-600">{completedRequests}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RestockStats;
