import { Link } from 'react-router-dom';

const recordStatusConfig = {
    IN_PROGRESS: { label: 'Đang điều trị', style: 'bg-amber-50 text-amber-700 border-amber-200' },
    COMPLETED: { label: 'Hoàn thành', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    CANCELLED: { label: 'Đã hủy', style: 'bg-red-50 text-red-500 border-red-200' },
};

const formatDate = (iso) => {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

/**
 * RecordDetailHeader
 * Props: record, pendingCount, onBack
 */
const RecordDetailHeader = ({ record, pendingCount, onBack }) => {
    const statusInfo = recordStatusConfig[record.status] || { label: record.status, style: 'bg-gray-100 text-gray-500 border-gray-200' };

    return (
        <div className="space-y-3">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-gray-400">
                <Link to="/dentist/dental-records" className="hover:text-teal-500 transition-colors">
                    Hồ Sơ Nha Khoa
                </Link>
                <span>/</span>
                <span className="text-gray-600 font-medium truncate max-w-[200px]">{record.record_name}</span>
            </nav>

            {/* Title row */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="text-sm text-gray-400 hover:text-teal-500 transition-colors whitespace-nowrap"
                    >
                        ← Quay lại
                    </button>
                    <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
                                {record.record_name}
                            </h1>
                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${statusInfo.style}`}>
                                {statusInfo.label}
                            </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {formatDate(record.start_date)
                                ? `Bắt đầu: ${formatDate(record.start_date)}`
                                : 'Chưa có ngày bắt đầu'}
                            {record.end_date && ` · Kết thúc: ${formatDate(record.end_date)}`}
                        </p>
                    </div>
                </div>

                {pendingCount > 0 && (
                    <span className="self-start md:self-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200 whitespace-nowrap">
                        {pendingCount} phiếu chờ duyệt
                    </span>
                )}
            </div>
        </div>
    );
};

export default RecordDetailHeader;
