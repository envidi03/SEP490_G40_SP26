import React from 'react';
import { Search } from 'lucide-react';

const EquipmentFilters = ({ searchTerm, setSearchTerm, statusFilter, setStatusFilter }) => {
    const filterButtons = [
        { value: 'all', label: 'Tất cả' },
        { value: 'READY', label: 'Sẵn sàng' },
        { value: 'IN_USE', label: 'Đang dùng' },
        { value: 'MAINTENANCE', label: 'Bảo trì' },
        { value: 'FAULTY', label: 'Bị hỏng' }
    ];

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
                {/* Search Input */}
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm thiết bị..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                </div>

                {/* Filter Buttons */}
                <div className="flex gap-2 flex-wrap lg:flex-nowrap">
                    {filterButtons.map(({ value, label }) => (
                        <button
                            key={value}
                            onClick={() => setStatusFilter(value)}
                            className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${statusFilter === value
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EquipmentFilters;
