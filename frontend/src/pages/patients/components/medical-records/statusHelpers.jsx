import React from 'react';

/* ── Treatment Status Config ── */
const statusConfig = {
    PLANNED: { label: 'Dự kiến', color: 'bg-gray-100 text-gray-700 border-gray-200' },
    APPROVED: { label: 'Đã duyệt', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    IN_PROGRESS: { label: 'Đang điều trị', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    DONE: { label: 'Hoàn thành', color: 'bg-green-100 text-green-700 border-green-200' },
    CANCELLED: { label: 'Đã huỷ', color: 'bg-red-100 text-red-700 border-red-200' },
    COMPLETED: { label: 'Đã hoàn thành', color: 'bg-green-100 text-green-700 border-green-200' },
};

export const getStatusBadge = (status) => {
    const cfg = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-600 border-gray-200' };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
            {cfg.label}
        </span>
    );
};

export const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
