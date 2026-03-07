/**
 * TreatmentListStats – Bộ lọc trạng thái phiếu điều trị (Minimalist UI)
 */
const TreatmentListStats = ({ activeFilter, onFilterChange }) => {
    const tabs = [
        { key: 'ALL', label: 'Tất cả phiếu' },
        { key: 'PENDING', label: 'Chờ phê duyệt' },
        { key: 'APPROVED', label: 'Đã duyệt' },
        { key: 'REJECTED', label: 'Từ chối' },
    ];

    return (
        <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-4">
            {tabs.map(tab => {
                const isActive = activeFilter === tab.key;
                return (
                    <button
                        key={tab.key}
                        onClick={() => onFilterChange(tab.key)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                ? 'bg-teal-500 text-white shadow-sm'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
};

export default TreatmentListStats;
