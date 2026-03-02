import React from 'react';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import Card from '../../../components/ui/Card';

const StatCard = ({ icon: Icon, title, value, color }) => (
    <Card className="hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-600">{title}</p>
                <p className="text-3xl font-bold mt-2 text-gray-900">{value}</p>
            </div>
            <div className={`p-4 rounded-full ${color}`}>
                <Icon size={24} className="text-white" />
            </div>
        </div>
    </Card>
);

const LeaveRequestStats = ({ stats }) => {
    const statItems = [
        {
            icon: Calendar,
            title: 'Tổng ngày nghỉ',
            value: stats.totalDays || 0,
            color: 'bg-blue-500'
        },
        {
            icon: Clock,
            title: 'Đang chờ duyệt',
            value: stats.pending || 0,
            color: 'bg-yellow-500'
        },
        {
            icon: CheckCircle,
            title: 'Đã duyệt',
            value: stats.approved || 0,
            color: 'bg-green-500'
        },
        {
            icon: XCircle,
            title: 'Bị từ chối',
            value: stats.rejected || 0,
            color: 'bg-red-500'
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slideUp">
            {statItems.map((stat, index) => (
                <StatCard key={index} {...stat} />
            ))}
        </div>
    );
};

export default LeaveRequestStats;
