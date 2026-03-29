const statusConfig = {
    WAITING_APPROVAL: { label: 'Chờ xử lý', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
    APPROVED: { label: 'Đã duyệt', bg: 'bg-teal-50 text-teal-700 border-teal-200' },
    REJECTED: { label: 'Từ chối', bg: 'bg-red-50 text-red-600 border-red-200' },
    PLANNED: { label: 'Kế hoạch', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
    IN_PROGRESS: { label: 'Đang thực hiện', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
    DONE: { label: 'Hoàn thành', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    CANCELLED: { label: 'Đã hủy', bg: 'bg-gray-100 text-gray-500 border-gray-200' },
};

const formatDate = (iso) => {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

/**
 * TreatmentItem – Hiển thị 1 phiếu điều trị trong trang phê duyệt
 * Bao gồm vị trí răng, đơn thuốc, nút phê duyệt/từ chối nổi bật
 */
const TreatmentItem = ({ treatment, onApprove, onReject, isProcessing }) => {
    const ts = statusConfig[treatment.status] || { label: treatment.status, bg: 'bg-gray-50 text-gray-500 border-gray-200' };
    const medicines = treatment.medicine_usage || [];
    const hasMedicines = medicines.length > 0;
    const isWaiting = treatment.status === 'WAITING_APPROVAL';
    const totalPrice = (treatment.planned_price || 0) * (treatment.quantity || 1);

    return (
        <div className={`rounded-xl border transition-all duration-150 ${isWaiting
            ? 'border-amber-200 bg-amber-50/30'
            : 'border-gray-100 bg-white'
            }`}>
            <div className="px-4 py-3.5 flex flex-col md:flex-row md:items-start gap-3">

                {/* Cột thông tin */}
                <div className="flex-1 min-w-0 space-y-2">
                    {/* Tên / vị trí + badge trạng thái */}
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-gray-800 text-sm leading-snug">
                            {treatment.tooth_position
                                ? `${treatment.tooth_position}`
                                : (treatment.note || 'Phiếu điều trị')}
                        </p>
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${ts.bg}`}>
                            {ts.label}
                        </span>
                        {treatment.phase === 'PLAN' && (
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full border bg-indigo-50 text-indigo-600 border-indigo-200">
                                Kế hoạch
                            </span>
                        )}
                    </div>

                    {/* Meta: bác sĩ & ngày */}
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-400">
                        {treatment.doctor_info?.full_name && (
                            <span>BS {treatment.doctor_info.full_name}</span>
                        )}
                        {treatment.planned_date && (
                            <span>KH: {formatDate(treatment.planned_date)}</span>
                        )}
                        {treatment.performed_date && (
                            <span>TH: {formatDate(treatment.performed_date)}</span>
                        )}
                        {totalPrice > 0 && (
                            <span className="text-teal-600 font-semibold">
                                {totalPrice.toLocaleString('vi-VN')}đ
                            </span>
                        )}
                    </div>

                    {/* Ghi chú */}
                    {treatment.note && treatment.tooth_position && (
                        <p className="text-[12px] text-gray-500 italic leading-relaxed">
                            {treatment.note}
                        </p>
                    )}

                    {/* Đơn thuốc tóm tắt */}
                    {hasMedicines && (
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                            <span className="text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                                {medicines.length} thuốc trong đơn
                            </span>
                            {medicines.slice(0, 2).map((med, idx) => {
                                const medName = med.medicine_id?.name || med.medicine_id?.medicine_name || `Thuốc ${idx + 1}`;
                                return (
                                    <span key={idx} className="text-[11px] text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">
                                        {medName} ×{med.quantity}
                                    </span>
                                );
                            })}
                            {medicines.length > 2 && (
                                <span className="text-[11px] text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">
                                    +{medicines.length - 2} khác
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Cột thao tác */}
                <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
                    {isWaiting ? (
                        <>
                            <button
                                onClick={() => onApprove(treatment._id || treatment.id)}
                                disabled={isProcessing}
                                className="flex items-center gap-1.5 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white text-[13px] font-semibold px-4 py-2 rounded-xl shadow-sm shadow-teal-100 transition-all duration-150 hover:shadow-md"
                            >
                                ✓ Phê duyệt
                            </button>
                            <button
                                onClick={() => onReject(treatment._id || treatment.id)}
                                disabled={isProcessing}
                                className="flex items-center gap-1.5 bg-white hover:bg-red-50 disabled:opacity-50 border border-red-200 text-red-600 text-[13px] font-semibold px-4 py-2 rounded-xl transition-all duration-150 hover:border-red-400"
                            >
                                ✕ Từ chối
                            </button>
                        </>
                    ) : (
                        <span className={`text-[12px] font-medium px-3 py-1.5 rounded-lg border ${ts.bg}`}>
                            {ts.label}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TreatmentItem;
