import { CheckSquare, Clock, CheckCircle, XCircle } from 'lucide-react';

const statCards = [
    { key: 'all', label: 'Tổng hồ sơ', colorClass: 'bg-blue-50   border-blue-200   text-blue-700' },
    { key: 'pending', label: 'Chờ duyệt', colorClass: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
    { key: 'approved', label: 'Đã duyệt', colorClass: 'bg-green-50  border-green-200  text-green-700' },
    { key: 'rejected', label: 'Từ chối', colorClass: 'bg-red-50    border-red-200    text-red-700' },
];

/**
 * ApprovalStats - Shows summary stat cards that also act as filter buttons
 */
const ApprovalStats = ({ stats, activeFilter, onFilterChange }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(s => (
            <button
                key={s.key}
                onClick={() => onFilterChange(s.key === 'all' ? 'ALL' : s.key.toUpperCase())}
                className={`rounded-xl border p-4 text-left transition-all ${s.colorClass} ${(s.key === 'all' && activeFilter === 'ALL') ||
                        (s.key !== 'all' && activeFilter === s.key.toUpperCase())
                        ? 'ring-2 ring-offset-1 ring-blue-400 shadow-md scale-[1.02]'
                        : 'hover:shadow-sm hover:scale-[1.01]'
                    }`}
            >
                <p className="text-2xl font-bold">{stats[s.key]}</p>
                <p className="text-sm font-medium mt-0.5">{s.label}</p>
            </button>
        ))}
    </div>
);

export default ApprovalStats;
