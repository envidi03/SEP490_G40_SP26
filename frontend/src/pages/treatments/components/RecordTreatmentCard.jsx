import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, FileText, User, ExternalLink, Clock, CheckCircle, XCircle } from 'lucide-react';
import Badge from '../../../components/ui/Badge';
import TreatmentRow from './TreatmentRow';

const recordStatusConfig = {
    IN_PROGRESS: { label: 'Đang điều trị', variant: 'warning' },
    COMPLETED: { label: 'Hoàn thành', variant: 'success' },
    CANCELLED: { label: 'Đã hủy', variant: 'danger' },
};

/**
 * RecordTreatmentCard
 *
 * Card hiển thị 1 hồ sơ nha khoa trong trang Danh Sách Phiếu Điều Trị.
 * Click vào header → expand/collapse danh sách phiếu.
 *
 * Props:
 *   - record         : dental record object
 *   - treatments     : Treatment[] thuộc hồ sơ này (đã filter theo statusFilter từ cha)
 *   - defaultExpanded: mở sẵn hay không (default false)
 */
const RecordTreatmentCard = ({ record, treatments, defaultExpanded = false }) => {
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    // Đếm theo trạng thái
    const pendingCount = treatments.filter(t => t.status === 'PENDING').length;
    const approvedCount = treatments.filter(t => t.status === 'APPROVED').length;
    const rejectedCount = treatments.filter(t => t.status === 'REJECTED').length;
    const totalCost = treatments.reduce((s, t) => s + t.unit_price * t.quantity, 0);

    const rStatus = recordStatusConfig[record.status] || { label: record.status, variant: 'default' };

    // Màu border theo tình trạng hồ sơ
    const borderClass =
        record.status === 'IN_PROGRESS' ? 'border-blue-200' :
            record.status === 'COMPLETED' ? 'border-green-200' :
                'border-gray-200';

    return (
        <div className={`bg-white rounded-xl border-2 shadow-sm transition-shadow hover:shadow-md ${borderClass}`}>
            {/* ── Header (clickable) ── */}
            <button
                className="w-full text-left p-5 flex items-start justify-between gap-4 group"
                onClick={() => setIsExpanded(prev => !prev)}
            >
                <div className="flex-1 space-y-2 min-w-0">
                    {/* Tên hồ sơ + badge trạng thái */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <FileText size={17} className="text-blue-500 flex-shrink-0" />
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors truncate">
                            {record.record_name}
                        </h3>
                        <Badge variant={rStatus.variant}>{rStatus.label}</Badge>
                    </div>

                    {/* Thông tin bệnh nhân */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                            <User size={14} className="text-gray-400" />
                            <strong className="text-gray-700">{record.patient_name}</strong>
                        </span>
                        {record.patient_dob && (
                            <span>📅 {record.patient_dob}</span>
                        )}
                        {record.patient_gender && (
                            <span>⚧ {record.patient_gender}</span>
                        )}
                    </div>

                    {/* Mini badges: tổng số phiếu theo trạng thái */}
                    <div className="flex gap-2 flex-wrap text-xs">
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
                            <span className="text-gray-400 italic">Không có phiếu nào</span>
                        )}
                    </div>
                </div>

                {/* Nút mở xem hồ sơ + chevron */}
                <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
                    <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/dentist/dental-records/${record.id}`); }}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-400 hover:text-blue-600 transition-colors"
                        title="Xem hồ sơ chi tiết"
                    >
                        <ExternalLink size={16} />
                    </button>
                    <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </div>
                </div>
            </button>

            {/* ── Danh sách phiếu (expanded) ── */}
            {isExpanded && (
                <div className="border-t border-gray-100 px-5 pb-4">
                    {treatments.length === 0 ? (
                        <p className="py-6 text-center text-sm text-gray-400 italic">
                            Không có phiếu điều trị nào
                        </p>
                    ) : (
                        <>
                            {/* Column header */}
                            <div className="flex items-center justify-between py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100 mb-1">
                                <span className="flex-1">Phiếu điều trị</span>
                                <span className="min-w-[110px] text-right pr-4">Đơn giá</span>
                                <span className="min-w-[110px] text-right">Trạng thái</span>
                            </div>

                            {treatments.map((t, idx) => (
                                <TreatmentRow key={t.id} treatment={t} index={idx} />
                            ))}

                            {/* Tổng tiền */}
                            <div className="flex justify-end pt-3 border-t border-gray-100 mt-1">
                                <span className="text-sm font-semibold text-gray-700">
                                    Tổng:{' '}
                                    <span className="text-green-700">
                                        {totalCost.toLocaleString('vi-VN')}đ
                                    </span>
                                </span>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default RecordTreatmentCard;
