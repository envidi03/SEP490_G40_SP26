import React from 'react';
import { ClipboardList } from 'lucide-react';

const ServiceStatistics = ({ totalServices }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-6">
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

        </div>
    );
};

export default ServiceStatistics;
