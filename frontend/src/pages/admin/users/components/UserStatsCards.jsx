import React from 'react';
import Card from '../../../../components/ui/Card';

const UserStatsCards = ({ stats }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <Card>
                <div className="text-center">
                    <p className="text-sm text-gray-600">Tổng số</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
            </Card>
            <Card>
                <div className="text-center">
                    <p className="text-sm text-gray-600">Hoạt động</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
                </div>
            </Card>
            <Card>
                <div className="text-center">
                    <p className="text-sm text-gray-600">Tạm khóa</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">{stats.inactive}</p>
                </div>
            </Card>
            <Card>
                <div className="text-center">
                    <p className="text-sm text-gray-600">Admin</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">{stats.admins}</p>
                </div>
            </Card>
            <Card>
                <div className="text-center">
                    <p className="text-sm text-gray-600">Bác sĩ</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{stats.doctors}</p>
                </div>
            </Card>
            <Card>
                <div className="text-center">
                    <p className="text-sm text-gray-600">Nhân viên</p>
                    <p className="text-2xl font-bold text-purple-600 mt-1">{stats.staff}</p>
                </div>
            </Card>
        </div>
    );
};

export default UserStatsCards;
