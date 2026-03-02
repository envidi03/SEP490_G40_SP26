import React from 'react';
import PropTypes from 'prop-types';
import { Search, Filter } from 'lucide-react';

/**
 * AppointmentFilters - Component tìm kiếm và lọc lịch khám
 * Bao gồm search box và dropdown filter theo trạng thái
 * 
 * @param {string} searchTerm - Giá trị tìm kiếm hiện tại
 * @param {function} onSearchChange - Callback khi thay đổi search
 * @param {string} statusFilter - Trạng thái filter hiện tại
 * @param {function} onStatusChange - Callback khi thay đổi status filter
 */
const AppointmentFilters = ({ searchTerm, onSearchChange, statusFilter, onStatusChange }) => {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="grid md:grid-cols-2 gap-4">
                {/* Search Box */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo bác sĩ hoặc lý do..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>

                {/* Status Filter Dropdown */}
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <select
                        value={statusFilter}
                        onChange={(e) => onStatusChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="Pending">Chờ xác nhận</option>
                        <option value="Confirmed">Đã xác nhận</option>
                        <option value="Completed">Hoàn thành</option>
                        <option value="Cancelled">Đã hủy</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

AppointmentFilters.propTypes = {
    searchTerm: PropTypes.string.isRequired,
    onSearchChange: PropTypes.func.isRequired,
    statusFilter: PropTypes.string.isRequired,
    onStatusChange: PropTypes.func.isRequired,
};

export default AppointmentFilters;
