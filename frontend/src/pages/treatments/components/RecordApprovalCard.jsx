import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, User, FileText, Clock, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import Badge from '../../../components/ui/Badge';
import TreatmentItem from './TreatmentItem';

const recordStatusConfig = {
    IN_PROGRESS: { label: 'Đang điều trị', variant: 'warning' },
    COMPLETED: { label: 'Hoàn thành', variant: 'success' },
    CANCELLED: { label: 'Đã hủy', variant: 'danger' },
};

/**
 * RecordApprovalCard
 *
 * Displays a dental record card with patient name, pending treatment count.
 * Click the header to expand/collapse the list of treatments.
 * Props:
 *   - record: { id, record_name, patient_name, patient_dob, patient_gender, status, ... }
 *   - treatments: Treatment[] linked to this record
 *   - filterStatus: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'
 *   - onApprove(treatmentId): void
 *   - onReject(treatmentId): void
 */
const RecordApprovalCard = ({ record, treatments, filterStatus, onApprove, onReject }) => {
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);

    const pendingCount = treatments.filter(t => t.status === 'PENDING').length;
    const approvedCount = treatments.filter(t => t.status === 'APPROVED').length;
    const rejectedCount = treatments.filter(t => t.status === 'REJECTED').length;

    // Filter treatments to display inside the card according to filterStatus
    const displayedTreatments = filterStatus === 'ALL'
        ? treatments
        : treatments.filter(t => t.status === filterStatus);

    const recordStatus = recordStatusConfig[record.status] || { label: record.status, variant: 'default' };

    // Highlight card border by pending status
    const borderClass = pendingCount > 0
        ? 'border-yellow-300 shadow-yellow-50'
        : 'border-gray-200';

    return (
        <div className={`bg-white rounded-xl border-2 shadow-sm transition-shadow hover:shadow-md ${borderClass}`}>
            {/* ── Card Header (always visible, clickable) ── */}
            <button
                className="w-full text-left p-5 flex items-start justify-between gap-4 group"
                onClick={() => setIsExpanded(prev => !prev)}
            >
                <div className="flex-1 space-y-2">
                    {/* Record name + status */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <FileText size={17} className="text-blue-500 flex-shrink-0" />
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                            {record.record_name}
                        </h3>
                        <Badge variant={recordStatus.variant}>{recordStatus.label}</Badge>
                    </div>

                    {/* Patient info */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1.5">
                            <User size={14} className="text-gray-400" />
                            <strong>{record.patient_name}</strong>
                        </span>
                        {record.patient_dob && (
                            <span className="text-gray-400">📅 {record.patient_dob}</span>
                        )}
                        {record.patient_gender && (
                            <span className="text-gray-400">⚧ {record.patient_gender}</span>
                        )}
                    </div>

                    {/* Mini treatment counts */}
                    <div className="flex gap-3 text-xs">
                        {pendingCount > 0 && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                                <Clock size={11} /> {pendingCount} chờ duyệt
                            </span>
                        )}
                        {approvedCount > 0 && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                                <CheckCircle size={11} /> {approvedCount} đã duyệt
                            </span>
                        )}
                        {rejectedCount > 0 && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">
                                <XCircle size={11} /> {rejectedCount} từ chối
                            </span>
                        )}
                        {treatments.length === 0 && (
                            <span className="text-gray-400 italic">Không có phiếu điều trị</span>
                        )}
                    </div>
                </div>

                {/* Right: chevron + link to detail */}
                <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/dentist/dental-records/${record.id}`);
                        }}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 hover:text-blue-700 transition-colors"
                        title="Xem hồ sơ chi tiết"
                    >
                        <ExternalLink size={16} />
                    </button>
                    <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </div>
                </div>
            </button>

            {/* ── Expanded Treatment List ── */}
            {isExpanded && (
                <div className="border-t border-gray-100 px-5 pb-4">
                    {displayedTreatments.length === 0 ? (
                        <p className="py-6 text-center text-sm text-gray-400 italic">
                            Không có phiếu điều trị nào với bộ lọc hiện tại
                        </p>
                    ) : (
                        <div>
                            {/* Column headers */}
                            <div className="flex items-center justify-between py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100 mb-1">
                                <span className="flex-1">Phiếu điều trị</span>
                                <span className="min-w-[100px] text-center">Đơn giá</span>
                                <span className="min-w-[160px] text-center">Thao tác</span>
                            </div>
                            {displayedTreatments.map(t => (
                                <TreatmentItem
                                    key={t.id}
                                    treatment={t}
                                    onApprove={onApprove}
                                    onReject={onReject}
                                />
                            ))}

                            {/* Total for this record */}
                            <div className="flex justify-end pt-3 border-t border-gray-100 mt-2">
                                <span className="text-sm font-semibold text-gray-700">
                                    Tổng:{' '}
                                    <span className="text-green-700">
                                        {displayedTreatments
                                            .reduce((s, t) => s + t.unit_price * t.quantity, 0)
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
