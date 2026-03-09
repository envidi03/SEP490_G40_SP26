import React from 'react';
import { Search } from 'lucide-react';

const RestockFilter = ({
    searchTerm,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    priorityFilter,
    onPriorityFilterChange
}) => {
    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                {/* Search */}
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên thuốc hoặc người gửi..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                </div>

                {/* Priority Filter */}
                <select
                    value={priorityFilter}
                    onChange={(e) => onPriorityFilterChange(e.target.value)}
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white font-medium text-gray-700"
                >
                    <option value="all">Mức độ (Tất cả)</option>
                    <option value="high">Ưu tiên cao</option>
                    <option value="medium">Bình thường</option>
                    <option value="low">Thấp</option>
                </select>

                {/* Status Filter */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto">
                    <button
                        onClick={() => onStatusFilterChange('all')}
                        className={`whitespace-nowrap px-4 py-2 rounded-lg font-medium transition-all ${statusFilter === 'all'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Tất cả
                    </button>
                    <button
                        onClick={() => onStatusFilterChange('pending')}
                        className={`whitespace-nowrap px-4 py-2 rounded-lg font-medium transition-all ${statusFilter === 'pending'
                            ? 'bg-yellow-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Chờ duyệt
                    </button>
                    <button
                        onClick={() => onStatusFilterChange('accept')}
                        className={`whitespace-nowrap px-4 py-2 rounded-lg font-medium transition-all ${statusFilter === 'accept'
                            ? 'bg-green-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Đã duyệt
                    </button>
                    <button
                        onClick={() => onStatusFilterChange('reject')}
                        className={`whitespace-nowrap px-4 py-2 rounded-lg font-medium transition-all ${statusFilter === 'reject'
                            ? 'bg-red-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Đã từ chối
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RestockFilter;
