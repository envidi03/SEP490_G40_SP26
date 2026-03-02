import React from 'react';
import Card from '../../../../components/ui/Card';
import { Search } from 'lucide-react';

const UserFilters = ({
    searchTerm,
    onSearchChange,
    filterRole,
    onRoleChange,
    filterStatus,
    onStatusChange
}) => {
    return (
        <Card className="mb-6">
            <div className="flex flex-col gap-4">
                {/* Search Bar */}
                <div className="relative">
                    <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={20}
                    />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên, email, username..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={onSearchChange}
                    />
                </div>

                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <select
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        value={filterRole}
                        onChange={onRoleChange}
                    >
                        <option value="all">Tất cả vai trò</option>
                        <option value="ADMIN_CLINIC">Quản trị viên</option>
                        <option value="DOCTOR">Bác sĩ</option>
                        <option value="RECEPTIONIST">Lễ tân</option>
                        <option value="PHARMACIST">Dược sĩ</option>
                        <option value="ASSISTANT">Trợ lý</option>
                    </select>

                    <select
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        value={filterStatus}
                        onChange={onStatusChange}
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="ACTIVE">Hoạt động</option>
                        <option value="INACTIVE">Tạm khóa</option>
                    </select>
                </div>
            </div>
        </Card>
    );
};

export default UserFilters;
