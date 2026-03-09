import React from 'react';
import { Search } from 'lucide-react';

const MedicineFilter = ({ searchTerm, onSearchChange, statusFilter, onStatusFilterChange }) => {
    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                {/* Search */}
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm thuốc..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onStatusFilterChange('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${statusFilter === 'all'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Tất cả
                    </button>
                    <button
                        onClick={() => onStatusFilterChange('EXPIRING_SOON')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${statusFilter === 'EXPIRING_SOON'
                            ? 'bg-yellow-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Sắp hết hạn
                    </button>
                    <button
                        onClick={() => onStatusFilterChange('LOW_STOCK')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${statusFilter === 'LOW_STOCK'
                            ? 'bg-orange-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Sắp hết hàng
                    </button>
                    <button
                        onClick={() => onStatusFilterChange('EXPIRED')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${statusFilter === 'EXPIRED'
                            ? 'bg-red-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Đã hết hạn
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MedicineFilter;
