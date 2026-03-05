/**
 * TreatmentListStats – Thống kê tổng số phiếu điều trị theo trạng thái
 * Các card cũng hoạt động như nút lọc khi truyền vào onFilterChange
 */
const TreatmentListStats = ({ stats, activeFilter, onFilterChange }) => {
    const cards = [
        { key: 'ALL', label: 'Tổng phiếu', colorClass: 'bg-blue-50   border-blue-200   text-blue-700' },
        { key: 'PENDING', label: 'Chờ phê duyệt', colorClass: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
        { key: 'APPROVED', label: 'Đã duyệt', colorClass: 'bg-green-50  border-green-200  text-green-700' },
        { key: 'REJECTED', label: 'Từ chối', colorClass: 'bg-red-50    border-red-200    text-red-700' },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cards.map(c => {
                const isActive = activeFilter === c.key;
                return (
                    <button
                        key={c.key}
                        onClick={() => onFilterChange(c.key)}
                        className={`rounded-xl border p-4 text-left transition-all ${c.colorClass} ${isActive
                                ? 'ring-2 ring-offset-1 ring-blue-400 shadow-md scale-[1.02]'
                                : 'hover:shadow-sm hover:scale-[1.01]'
                            }`}
                    >
                        <p className="text-2xl font-bold">{stats[c.key.toLowerCase()] ?? stats.all}</p>
                        <p className="text-sm font-medium mt-0.5">{c.label}</p>
                    </button>
                );
            })}
        </div>
    );
};

export default TreatmentListStats;
