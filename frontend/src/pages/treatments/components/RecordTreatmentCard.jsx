import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TreatmentRow from './TreatmentRow';

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
 * RecordTreatmentCard
 *
 * Card hiển thị 1 hồ sơ nha khoa, click vào để expand/collapse danh sách phiếu bên trong.
 * (Sử dụng dữ liệu từ API getListOfPatientService trả về có sẵn treatments)
 */
const RecordTreatmentCard = ({ record, defaultExpanded = false }) => {
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    // Phiếu điều trị từ API (gắn sẵn trong record)
    const treatments = record.treatments || [];

    // Tính toán mini-stats
    const pendingCount = treatments.filter(t => t.status === 'PENDING').length;
    const approvedCount = treatments.filter(t => t.status === 'APPROVED').length;
    const rejectedCount = treatments.filter(t => t.status === 'REJECTED').length;

    // Tính tổng tiền dựa trên treatments API (tùy thuộc API schema, ví dụ unit_price * quantity, 
    // bên backend schema Treatment có price, quantity, total)
    const totalCost = treatments.reduce((sum, t) => sum + (t.total || (t.cost * (t.quantity || 1)) || 0), 0);

    const rStatus = statusConfig[record.status] || { label: record.status, style: 'bg-gray-100 text-gray-500 border-gray-200' };

    // Màu viền và title hover
    const activeBorderClass = record.status === 'IN_PROGRESS'
        ? 'hover:border-teal-300'
        : 'hover:border-emerald-300';

    const activeTextClass = record.status === 'IN_PROGRESS'
        ? 'group-hover:text-teal-700 text-gray-900'
        : 'group-hover:text-emerald-700 text-gray-900';

    return (
        <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm transition-all duration-200 ${activeBorderClass}`}>
            {/* Header (Click to toggle expand) */}
            <button
                type="button"
                className="w-full text-left p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 group rounded-t-2xl focus:outline-none"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex-1 min-w-0 space-y-2">
                    {/* Tên hồ sơ + Status */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className={`text-[15px] font-semibold transition-colors ${activeTextClass} truncate`}>
                            {record.record_name}
                        </h3>
                        <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${rStatus.style}`}>
                            {rStatus.label}
                        </span>
                    </div>

                    {/* Thông tin bệnh nhân & Bác sĩ */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-gray-500">
                        {record.patient_id && record.patient_id.full_name && (
                            <span className="font-medium text-gray-700">{record.patient_id.full_name}</span>
                        )}
                        {/* Nếu API trả về patient_id là string thay vì object thì dùng record.full_name nếu có */}
                        {(!record.patient_id || typeof record.patient_id === 'string') && record.patient_name && (
                            <span className="font-medium text-gray-700">{record.patient_name}</span>
                        )}

                        {record.doctor_info?.profile?.full_name && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                <span>BS {record.doctor_info.profile.full_name}</span>
                            </>
                        )}

                        {(record.start_date || record.end_date) && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                <span>
                                    {formatDate(record.start_date) || '?'} {'→'} {formatDate(record.end_date) || 'Nay'}
                                </span>
                            </>
                        )}
                    </div>

                    {/* Mini badges đếm trạng thái phiếu */}
                    <div className="flex flex-wrap gap-2 text-xs pt-1">
                        {pendingCount > 0 && (
                            <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-1 rounded-lg font-medium">
                                {pendingCount} phiếu chờ duyệt
                            </span>
                        )}
                        {approvedCount > 0 && (
                            <span className="bg-teal-50 text-teal-700 border border-teal-100 px-2.5 py-1 rounded-lg font-medium">
                                {approvedCount} phiếu đã duyệt
                            </span>
                        )}
                        {rejectedCount > 0 && (
                            <span className="bg-red-50 text-red-600 border border-red-100 px-2.5 py-1 rounded-lg font-medium">
                                {rejectedCount} phiếu từ chối
                            </span>
                        )}
                        {treatments.length === 0 && (
                            <span className="text-gray-400 italic">Chưa có phiếu điều trị</span>
                        )}
                    </div>
                </div>

                {/* Nút Xem chi tiết & Chevron */}
                <div className="flex items-center self-end md:self-auto gap-3 flex-shrink-0 pt-1 md:pt-0">
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/dentist/dental-records/${record._id || record.id}`);
                        }}
                        className="px-4 py-1.5 rounded-xl border border-teal-500 text-teal-600 text-[13px] font-medium hover:bg-teal-500 hover:text-white transition-all duration-200"
                    >
                        Xem chi tiết
                    </div>

                    {/* Fake Chevron built without icons */}
                    <div className="w-6 h-6 flex items-center justify-center text-gray-400 group-hover:text-gray-600">
                        {isExpanded ? (
                            <span className="text-sm font-bold opacity-70 rotate-180 transform">▼</span>
                        ) : (
                            <span className="text-sm font-bold opacity-70">▼</span>
                        )}
                    </div>
                </div>
            </button>

            {/* Danh sách phiếu điều trị (Expanded) */}
            {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50/30 px-5 pt-2 pb-5 rounded-b-2xl">
                    {treatments.length === 0 ? (
                        <p className="py-8 text-center text-[13px] text-gray-400">
                            Không có phiếu điều trị nào trong hồ sơ này
                        </p>
                    ) : (
                        <div className="space-y-1">
                            {treatments.map((t, idx) => (
                                <TreatmentRow key={t._id || t.id || idx} treatment={t} index={idx} />
                            ))}

                            {/* Tổng giá trị */}
                            {totalCost > 0 && (
                                <div className="flex justify-end pt-5 border-t border-gray-200 mt-4 mr-2">
                                    <div className="text-[13px] font-medium text-gray-500">
                                        Tổng thiết tính:{' '}
                                        <span className="text-base font-bold text-teal-700 ml-2">
                                            {totalCost.toLocaleString('vi-VN')}đ
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RecordTreatmentCard;
