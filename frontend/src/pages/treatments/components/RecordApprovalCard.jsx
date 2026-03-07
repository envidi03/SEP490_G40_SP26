import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TreatmentItem from './TreatmentItem';

const statusConfig = {
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
 */
const RecordApprovalCard = ({ record, defaultExpanded = false, filterStatus, onApprove, onReject, processingIds = [] }) => {
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    // Phiếu điều trị từ API (gắn sẵn trong record)
    const treatments = record.treatments || [];

    const stats = {
        WAITING_APPROVAL: treatments.filter(t => t.status === 'WAITING_APPROVAL').length,
        APPROVED: treatments.filter(t => t.status === 'APPROVED').length,
        REJECTED: treatments.filter(t => t.status === 'REJECTED').length,
    };

    // Filter list inside card
    const displayedTreatments = filterStatus === 'ALL'
        ? treatments
        : treatments.filter(t => t.status === filterStatus);

    const rStatus = statusConfig[record.status] || { label: record.status, style: 'bg-gray-100 text-gray-500 border-gray-200' };

    // Highlight card border by pending status
    const borderClass = stats.WAITING_APPROVAL > 0
        ? 'border-amber-200 shadow-amber-50/50 hover:border-amber-400'
        : 'border-gray-100 hover:border-teal-300';

    return (
        <div className={`bg-white rounded-2xl border-2 shadow-sm transition-all duration-200 ${borderClass}`}>
            {/* ── Card Header (Click to toggle expand) ── */}
            <button
                type="button"
                className="w-full text-left p-5 flex flex-col md:flex-row items-start justify-between gap-4 group focus:outline-none"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex-1 min-w-0 space-y-2">
                    {/* Record name + status */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-[15px] font-semibold text-gray-900 group-hover:text-teal-700 transition-colors truncate">
                            {record.record_name}
                        </h3>
                        <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${rStatus.style}`}>
                            {rStatus.label}
                        </span>
                    </div>

                    {/* Patient info */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-gray-500">
                        {record.patient_id && record.patient_id.full_name && (
                            <span className="font-medium text-gray-700">{record.patient_id.full_name}</span>
                        )}
                        {(!record.patient_id || typeof record.patient_id === 'string') && record.patient_name && (
                            <span className="font-medium text-gray-700">{record.patient_name}</span>
                        )}

                        {record.doctor_info?.profile?.full_name && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                <span>BS {record.doctor_info.profile.full_name}</span>
                            </>
                        )}
                    </div>

                    {/* Mini treatment counts */}
                    <div className="flex flex-wrap gap-2 text-xs pt-1">
                        {stats.WAITING_APPROVAL > 0 && (
                            <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-1 rounded-lg font-medium">
                                {stats.WAITING_APPROVAL} chờ xử lý
                            </span>
                        )}
                        {stats.APPROVED > 0 && (
                            <span className="bg-teal-50 text-teal-700 border border-teal-100 px-2.5 py-1 rounded-lg font-medium">
                                {stats.APPROVED} đã duyệt
                            </span>
                        )}
                        {stats.REJECTED > 0 && (
                            <span className="bg-red-50 text-red-600 border border-red-100 px-2.5 py-1 rounded-lg font-medium">
                                {stats.REJECTED} từ chối
                            </span>
                        )}
                        {treatments.length === 0 && (
                            <span className="text-gray-400 italic">Không có phiếu điều trị</span>
                        )}
                    </div>
                </div>

                {/* Right: View detail + Chevron */}
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
                        {isExpanded ? (
                            <span className="text-sm font-bold opacity-70 rotate-180 transform">▼</span>
                        ) : (
                            <span className="text-sm font-bold opacity-70">▼</span>
                        )}
                    </div>
                </div>
            </button>

            {/* ── Expanded Treatment List ── */}
            {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50/30 px-5 pt-2 pb-5 rounded-b-2xl">
                    {displayedTreatments.length === 0 ? (
                        <p className="py-8 text-center text-[13px] text-gray-400">
                            Không có phiếu điều trị nào khớp với bộ lọc
                        </p>
                    ) : (
                        <div>
                            {/* Column headers */}
                            <div className="flex items-center justify-between py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100 mb-1 px-2">
                                <span className="flex-1">Phiếu điều trị</span>
                                <span className="min-w-[100px] text-center">Đơn giá</span>
                                <span className="min-w-[160px] text-right">Thao tác</span>
                            </div>

                            <div className="space-y-1">
                                {displayedTreatments.map(t => (
                                    <TreatmentItem
                                        key={t._id || t.id}
                                        treatment={t}
                                        isProcessing={processingIds.includes(t._id || t.id)}
                                        onApprove={onApprove}
                                        onReject={onReject}
                                    />
                                ))}
                            </div>

                            {/* Total for this record */}
                            <div className="flex justify-end pt-5 border-t border-gray-200 mt-4 mr-2">
                                <span className="text-[13px] font-medium text-gray-500">
                                    Tổng thiết tính:{' '}
                                    <span className="text-base font-bold text-teal-700 ml-2">
                                        {displayedTreatments
                                            .reduce((s, t) => s + ((t.unit_price || 0) * (t.quantity || 1)), 0)
                                            .toLocaleString('vi-VN')}đ
                                    </span>
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RecordApprovalCard;
