import { useNavigate } from 'react-router-dom';

const statusConfig = {
    IN_PROGRESS: { label: 'Đang điều trị', style: 'bg-amber-50 text-amber-700 border-amber-200' },
    COMPLETED: { label: 'Hoàn thành', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    CANCELLED: { label: 'Đã hủy', style: 'bg-red-50 text-red-500 border-red-200' },
};

const formatDate = (iso) => {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const normalize = (str) => (str || '').trim().toLowerCase();

/**
 * PatientRecordList
 * Props:
 *   patient       – bệnh nhân tài khoản đang được chọn
 *   records       – mảng dental records
 *   isLoading     – bool
 *   error         – string | null
 *   onRetry       – callback
 *   onCreateClick – callback mở modal tạo hồ sơ
 */
const PatientRecordList = ({ patient, records, isLoading, error, onRetry, onCreateClick }) => {
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <div className="space-y-3 animate-pulse">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-gray-50 rounded-2xl h-24" />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 text-sm text-red-600 flex items-center justify-between">
                <span>{error}</span>
                <button onClick={onRetry} className="underline font-medium hover:text-red-700">Thử lại</button>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Header: tên bệnh nhân + nút tạo */}
            <div className="flex items-center justify-between px-1">
                <div>
                    <span className="text-sm font-medium text-gray-700">{patient.full_name}</span>
                    <span className="ml-2 text-gray-400 text-xs">· {records.length} hồ sơ</span>
                </div>

                <button
                    onClick={onCreateClick}
                    className="px-4 py-1.5 rounded-xl bg-teal-500 text-white text-sm font-medium hover:bg-teal-600 transition-colors"
                >
                    + Tạo hồ sơ mới
                </button>
            </div>

            {/* Empty state */}
            {records.length === 0 && (
                <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-14 text-center text-gray-400 text-sm">
                    Bệnh nhân này chưa có hồ sơ nha khoa nào
                </div>
            )}

            {/* Record cards */}
            {records.map(record => {
                const statusInfo = statusConfig[record.status] || { label: record.status, style: 'bg-gray-100 text-gray-500 border-gray-200' };
                // Hồ sơ người thân: tên trong hồ sơ khác tên tài khoản bệnh nhân
                const isRelative = record.full_name
                    && normalize(record.full_name) !== normalize(patient.full_name);

                return (
                    <div
                        key={record._id}
                        className={`group bg-white border rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 ${isRelative
                            ? 'border-purple-100 hover:border-purple-300'
                            : 'border-gray-100 hover:border-teal-200'
                            }`}
                    >
                        {/* Badge người thân */}
                        {isRelative && (
                            <div className="px-5 pt-3 pb-0">
                                <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full">
                                    Hồ sơ người thân · {record.full_name}
                                </span>
                            </div>
                        )}

                        <div className="p-5">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div className="flex-1 min-w-0 space-y-2">
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <h3 className={`text-md font-semibold transition-colors ${isRelative ? 'text-purple-900 group-hover:text-purple-700' : 'text-gray-900 group-hover:text-teal-700'}`}>
                                            {record.record_name}
                                        </h3>
                                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${statusInfo.style}`}>
                                            {statusInfo.label}
                                        </span>
                                    </div>

                                    {record.created_by?.full_name && (
                                        <p className="text-xs text-gray-500">
                                            <span className="text-gray-400 uppercase tracking-wide mr-1">BS</span>
                                            {record.created_by.full_name}
                                        </p>
                                    )}

                                    {record.description && (
                                        <p className="text-xs text-gray-500 line-clamp-1">{record.description}</p>
                                    )}

                                    <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                                        {formatDate(record.start_date) && (
                                            <span>Bắt đầu: {formatDate(record.start_date)}</span>
                                        )}
                                        {formatDate(record.end_date) && (
                                            <span>Kết thúc: {formatDate(record.end_date)}</span>
                                        )}
                                        {record.treatments?.length > 0 && (
                                            <span className="text-teal-500 font-medium">
                                                {record.treatments.length} phiếu điều trị
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate(`/dentist/dental-records/${record._id}`)}
                                    className={`flex-shrink-0 self-center px-4 py-1.5 rounded-xl border text-sm font-medium transition-all duration-200 ${isRelative
                                        ? 'border-purple-400 text-purple-600 hover:bg-purple-500 hover:text-white'
                                        : 'border-teal-500 text-teal-600 hover:bg-teal-500 hover:text-white'
                                        }`}
                                >
                                    Xem chi tiết
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default PatientRecordList;
