const statusConfig = {
    PLANNED: { label: 'Đã lên kế hoạch', style: 'bg-blue-50 text-blue-700 border-blue-200' },
    WAITING_APPROVAL: { label: 'Chờ phê duyệt', style: 'bg-amber-50 text-amber-700 border-amber-200' },
    APPROVED: { label: 'Đã phê duyệt', style: 'bg-teal-50 text-teal-700 border-teal-200' },
    REJECTED: { label: 'Từ chối', style: 'bg-red-50 text-red-600 border-red-200' },
    IN_PROGRESS: { label: 'Đang thực hiện', style: 'bg-purple-50 text-purple-700 border-purple-200' },
    DONE: { label: 'Hoàn thành', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    CANCELLED: { label: 'Đã hủy', style: 'bg-gray-100 text-gray-500 border-gray-200' },
};

/**
 * TreatmentRow – Hiển thị 1 dòng phiếu điều trị (minimalist UI)
 * Có nút "Xem chi tiết" để mở modal
 */
const TreatmentRow = ({ treatment, index, onViewDetail, isLatest = false }) => {
    const ts = statusConfig[treatment.status] || { label: treatment.status, style: 'bg-gray-50 text-gray-500 border-gray-200' };
    const hasMedicines = treatment.medicine_usage && treatment.medicine_usage.length > 0;

    return (
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors px-2 rounded-xl">
            {/* Index + name + description */}
            <div className="flex gap-4 flex-1 min-w-0">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-50 text-teal-600 text-xs font-semibold flex items-center justify-center mt-0.5 border border-teal-100">
                    {index + 1}
                </span>
                <div className="min-w-0 space-y-1.5">
                    {/* Title row */}
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-gray-800 text-sm">
                            {treatment.tooth_position
                                ? `${treatment.tooth_position}`
                                : (treatment.note || 'Phiếu điều trị')}
                        </p>
                        {isLatest && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500 text-white">
                                Mới nhất
                            </span>
                        )}
                        {hasMedicines && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                                {treatment.medicine_usage.length} thuốc
                            </span>
                        )}
                    </div>

                    {/* Meta info */}
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-400">
                        {treatment.phase === 'PLAN' && (
                            <span className="text-indigo-500 font-medium">Kế hoạch</span>
                        )}
                        {treatment.phase === 'SESSION' && treatment.performed_date && (
                            <span>
                                {new Date(treatment.performed_date).toLocaleDateString('vi-VN')}
                            </span>
                        )}
                        {treatment.phase === 'PLAN' && treatment.planned_date && (
                            <span>
                                KH: {new Date(treatment.planned_date).toLocaleDateString('vi-VN')}
                            </span>
                        )}
                        {treatment.doctor_info?.full_name && (
                            <span>BS {treatment.doctor_info.full_name}</span>
                        )}
                    </div>

                    {treatment.note && treatment.tooth_position && (
                        <p className="text-xs text-gray-400 italic bg-white border border-gray-100 px-2 py-1 rounded-lg inline-block">
                            {treatment.note}
                        </p>
                    )}
                </div>
            </div>

            {/* Price & Status & Action */}
            <div className="flex items-center md:flex-col md:items-end gap-3 justify-between md:justify-start flex-shrink-0 md:pl-4">
                <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${ts.style}`}>
                    {ts.label}
                </span>

                <div className="flex items-center gap-2">
                    {treatment.planned_price > 0 && (
                        <div className="text-sm font-semibold text-gray-700">
                            {((treatment.planned_price || 0) * (treatment.quantity || 1)).toLocaleString('vi-VN')}đ
                        </div>
                    )}
                    <button
                        onClick={() => onViewDetail && onViewDetail(treatment)}
                        className="text-[12px] font-medium px-3 py-1 rounded-lg border border-teal-400 text-teal-600 hover:bg-teal-500 hover:text-white transition-all duration-200"
                    >
                        Chi tiết
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TreatmentRow;
