import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TreatmentItem from './TreatmentItem';

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
 * RecordApprovalCard
 *
 * Card gom nhóm các phiếu điều trị cần phê duyệt của cùng 1 hồ sơ.
 * Mặc định auto-expand nếu có phiếu WAITING_APPROVAL.
 */
const RecordApprovalCard = ({ record, defaultExpanded = false, filterStatus, onApprove, onReject, processingIds = [] }) => {
    const navigate = useNavigate();

    const treatments = record.treatments || [];

    const waitingCount = treatments.filter(t => t.status === 'WAITING_APPROVAL').length;
    const approvedCount = treatments.filter(t => t.status === 'APPROVED').length;
    const rejectedCount = treatments.filter(t => t.status === 'REJECTED').length;

    // Auto-expand khi có phiếu đang chờ duyệt
    const [isExpanded, setIsExpanded] = useState(defaultExpanded || waitingCount > 0);

    const displayedTreatments = filterStatus === 'ALL'
        ? treatments
        : treatments.filter(t => t.status === filterStatus);

    const rStatus = recordStatusConfig[record.status] || { label: record.status, style: 'bg-gray-100 text-gray-500 border-gray-200' };

    // Viền nổi bật nếu còn phiếu đang chờ
    const borderClass = waitingCount > 0
        ? 'border-amber-300 shadow-amber-50'
        : 'border-gray-100';

    const patientName = record.patient_id?.full_name
        || (typeof record.patient_id !== 'object' ? record.patient_name : null)
        || record.full_name
        || '—';

    return (
        <div className={`bg-white rounded-2xl border-2 shadow-sm transition-all duration-200 ${borderClass}`}>

            {/* ── Card Header ── */}
            <button
                type="button"
                className="w-full text-left p-5 flex flex-col md:flex-row items-start justify-between gap-4 group focus:outline-none"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex-1 min-w-0 space-y-2">
                    {/* Tên hồ sơ + status */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-[15px] font-semibold text-gray-900 group-hover:text-teal-700 transition-colors truncate">
                            {record.record_name}
                        </h3>
                        <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${rStatus.style}`}>
                            {rStatus.label}
                        </span>
                    </div>

                    {/* Patient / Doctor / Date */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-gray-500">
                        <span className="font-semibold text-gray-700">{patientName}</span>

                        {record.doctor_info?.profile?.full_name && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                <span>BS {record.doctor_info.profile.full_name}</span>
                            </>
                        )}

                        {record.start_date && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                <span>Từ {formatDate(record.start_date)}</span>
                            </>
                        )}
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 text-xs pt-0.5">
                        {waitingCount > 0 && (
                            <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg font-bold">
                                {waitingCount} chờ xử lý
                            </span>
                        )}
                        {approvedCount > 0 && (
                            <span className="bg-teal-50 text-teal-700 border border-teal-100 px-2.5 py-1 rounded-lg font-medium">
                                {approvedCount} đã duyệt
                            </span>
                        )}
                        {rejectedCount > 0 && (
                            <span className="bg-red-50 text-red-600 border border-red-100 px-2.5 py-1 rounded-lg font-medium">
                                {rejectedCount} từ chối
                            </span>
                        )}
                        {treatments.length === 0 && (
                            <span className="text-gray-400 italic">Không có phiếu điều trị</span>
                        )}
                    </div>
                </div>

                {/* Right: Nút hồ sơ + chevron */}
                <div className="flex items-center self-end md:self-auto gap-3 flex-shrink-0 pt-1 md:pt-0">
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/dentist/dental-records/${record._id || record.id}`);
                        }}
                        className="px-4 py-1.5 rounded-xl border border-teal-500 text-teal-600 text-[13px] font-medium hover:bg-teal-500 hover:text-white transition-all duration-200"
                    >
                        Hồ sơ
                    </div>
                    <div className="w-6 h-6 flex items-center justify-center text-gray-400 group-hover:text-gray-600">
                        <span className={`text-sm font-bold opacity-70 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                    </div>
                </div>
            </button>

            {/* ── Expanded: danh sách phiếu ── */}
            {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50/20 px-5 pt-3 pb-5 rounded-b-2xl space-y-2">
                    {displayedTreatments.length === 0 ? (
                        <p className="py-8 text-center text-[13px] text-gray-400">
                            Không có phiếu điều trị nào khớp với bộ lọc
                        </p>
                    ) : (
                        <>
                            {displayedTreatments.map(t => (
                                <TreatmentItem
                                    key={t._id || t.id}
                                    treatment={t}
                                    isProcessing={processingIds.includes(t._id || t.id)}
                                    onApprove={onApprove}
                                    onReject={onReject}
                                />
                            ))}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default RecordApprovalCard;
