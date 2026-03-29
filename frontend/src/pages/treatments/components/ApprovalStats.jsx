/**
 * ApprovalStats - Stats & filter tabs cho trang Phê Duyệt Phiếu Điều Trị
 * Tập trung vào WAITING_APPROVAL là tiêu điểm chính
 */
const ApprovalStats = ({ stats, activeFilter, onFilterChange }) => {
    const waiting = stats.WAITING_APPROVAL || 0;
    const approved = stats.APPROVED || 0;
    const rejected = stats.REJECTED || 0;

    return (
        <div className="space-y-4">
            {/* Hero card – số phiếu cho chờ duyệt */}
            <div
                className={`
                    relative overflow-hidden rounded-2xl border-2 p-5 transition-all duration-200 cursor-pointer
                    ${activeFilter === 'WAITING_APPROVAL'
                        ? 'border-amber-400 bg-amber-50 shadow-md shadow-amber-100'
                        : 'border-amber-200 bg-amber-50/50 hover:border-amber-300 hover:shadow-sm'}
                `}
                onClick={() => onFilterChange('WAITING_APPROVAL')}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">
                            Chờ Phê Duyệt
                        </p>
                        <p className="text-5xl font-extrabold text-amber-700 leading-none">
                            {waiting}
                        </p>
                        <p className="text-sm text-amber-600/80 mt-1.5">phiếu đang cần xử lý</p>
                    </div>
                </div>

                {activeFilter === 'WAITING_APPROVAL' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-400 rounded-b-xl" />
                )}
            </div>

            {/* Secondary tabs */}
            <div className="grid grid-cols-2 gap-3">
                {/* Đã duyệt */}
                <button
                    onClick={() => onFilterChange('APPROVED')}
                    className={`rounded-xl border p-4 text-left transition-all duration-200
                        ${activeFilter === 'APPROVED'
                            ? 'bg-teal-50 border-teal-400 ring-2 ring-teal-300 ring-offset-1 shadow-sm'
                            : 'bg-teal-50/60 border-teal-100 hover:border-teal-300 hover:shadow-sm'}
                    `}
                >
                    <p className="text-2xl font-bold text-teal-700">{approved}</p>
                    <p className="text-[13px] font-medium text-teal-600 mt-0.5">Đã phê duyệt</p>
                </button>

                {/* Từ chối */}
                <button
                    onClick={() => onFilterChange('REJECTED')}
                    className={`rounded-xl border p-4 text-left transition-all duration-200
                        ${activeFilter === 'REJECTED'
                            ? 'bg-red-50 border-red-400 ring-2 ring-red-300 ring-offset-1 shadow-sm'
                            : 'bg-red-50/60 border-red-100 hover:border-red-300 hover:shadow-sm'}
                    `}
                >
                    <p className="text-2xl font-bold text-red-600">{rejected}</p>
                    <p className="text-[13px] font-medium text-red-500 mt-0.5">Đã từ chối</p>
                </button>
            </div>
        </div>
    );
};

export default ApprovalStats;
