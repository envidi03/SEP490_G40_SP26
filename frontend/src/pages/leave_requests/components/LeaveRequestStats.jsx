const LeaveRequestStats = ({ stats, activeFilter, onFilterChange }) => {
    const statCards = [
        { key: 'All', label: 'Tổng số ngày', value: stats.totalDays || 0, bg: 'bg-blue-50 text-blue-700 border-blue-100' },
        { key: 'PENDING', label: 'Đang chờ duyệt', value: stats.pending || 0, bg: 'bg-amber-50 text-amber-700 border-amber-100' },
        { key: 'APPROVED', label: 'Đã duyệt', value: stats.approved || 0, bg: 'bg-teal-50 text-teal-700 border-teal-100' },
        { key: 'REJECTED', label: 'Từ chối', value: stats.rejected || 0, bg: 'bg-red-50 text-red-600 border-red-100' },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {statCards.map(s => {
                const isActive = activeFilter === s.key;
                return (
                    <button
                        key={s.key}
                        onClick={() => onFilterChange(s.key)}
                        className={`rounded-2xl border p-4 text-left transition-all duration-200 ${s.bg} ${isActive
                                ? 'ring-2 ring-offset-2 ring-teal-400 shadow-md scale-[1.02] border-transparent'
                                : 'hover:shadow-sm hover:scale-[1.01] opacity-80 hover:opacity-100'
                            }`}
                    >
                        <p className="text-3xl font-bold tracking-tight">{s.value}</p>
                        <p className="text-[13px] font-medium mt-1">{s.label}</p>
                    </button>
                );
            })}
        </div>
    );
};

export default LeaveRequestStats;
