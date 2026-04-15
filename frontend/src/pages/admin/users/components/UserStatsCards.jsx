import React from 'react';
import Card from '../../../../components/ui/Card';

const UserStatsCards = ({ stats }) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 mb-6">

            {/* Card */}
            <div className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition">
                <p className="text-sm text-gray-500">Tổng số</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition">
                <p className="text-sm text-gray-500">Hoạt động</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.active}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition">
                <p className="text-sm text-gray-500">Tạm khóa</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.inactive}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition">
                <p className="text-sm text-gray-500">Bác sĩ</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.doctors}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition">
                <p className="text-sm text-gray-500">Nhân viên</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{stats.staff}</p>
            </div>

        </div>
    );
};

export default UserStatsCards;
