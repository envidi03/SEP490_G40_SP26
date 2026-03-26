import React from 'react';

const InvoiceFilters = ({ statusFilter, onFilterChange }) => {
    const filters = [
        { value: 'all', label: 'Tất cả' },
        { value: 'PENDING', label: 'Chờ thanh toán' },
        { value: 'COMPLETED', label: 'Đã thanh toán' },
        { value: 'CANCELLED', label: 'Đã hủy' },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex gap-2 flex-wrap">
            {filters.map(opt => (
                <button
                    key={opt.value}
                    onClick={() => onFilterChange(opt.value)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${statusFilter === opt.value
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
};

export default InvoiceFilters;
