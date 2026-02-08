import React from 'react';
import { Package, CheckCircle, Activity, Wrench, AlertTriangle, XCircle, PackageCheck } from 'lucide-react';

const EquipmentStatistics = ({
    totalEquipment,
    readyEquipment,
    inUseEquipment,
    maintenanceCount,
    repairingCount,
    faultyCount,
    sterilizingCount
}) => {
    const stats = [
        {
            label: 'Tổng thiết bị',
            value: totalEquipment,
            icon: Package,
            gradient: 'from-indigo-500 to-purple-600',
            color: 'indigo-600'
        },
        {
            label: 'Sẵn sàng',
            value: readyEquipment,
            icon: CheckCircle,
            gradient: 'from-green-500 to-emerald-600',
            color: 'green-600'
        },
        {
            label: 'Đang sử dụng',
            value: inUseEquipment,
            icon: Activity,
            gradient: 'from-blue-500 to-cyan-600',
            color: 'blue-600'
        },
        {
            label: 'Bảo trì',
            value: maintenanceCount,
            icon: Wrench,
            gradient: 'from-yellow-500 to-orange-600',
            color: 'yellow-600'
        },
        {
            label: 'Đang sửa chữa',
            value: repairingCount,
            icon: AlertTriangle,
            gradient: 'from-orange-500 to-red-600',
            color: 'orange-600'
        },
        {
            label: 'Bị hỏng',
            value: faultyCount,
            icon: XCircle,
            gradient: 'from-red-500 to-rose-600',
            color: 'red-600'
        },
        {
            label: 'Đang khử trùng',
            value: sterilizingCount,
            icon: PackageCheck,
            gradient: 'from-purple-500 to-indigo-600',
            color: 'purple-600'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                                <Icon className="text-white" size={28} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                                <p className={`text-3xl font-bold text-${stat.color}`}>{stat.value}</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default EquipmentStatistics;
