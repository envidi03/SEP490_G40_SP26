const statusConfig = {
    WAITING_APPROVAL: { label: 'Chờ xử lý', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
    APPROVED: { label: 'Đã duyệt', bg: 'bg-teal-50 text-teal-700 border-teal-200' },
    REJECTED: { label: 'Từ chối', bg: 'bg-red-50 text-red-600 border-red-200' },
};

/**
 * TreatmentItem - Hiển thị 1 dòng phiếu điều trị với nút phê duyệt/từ chối (Minimalist)
 */
const TreatmentItem = ({ treatment, onApprove, onReject, isProcessing }) => {
    const ts = statusConfig[treatment.status] || { label: treatment.status, bg: 'bg-gray-50 text-gray-500 border-gray-200' };

    return (
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors px-2 rounded-xl">
            {/* Cột trái: Thông tin */}
            <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                    <p className="font-semibold text-gray-800 text-sm">{treatment.treatment_name || 'Dịch vụ'}</p>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${ts.bg}`}>
                        {ts.label}
                    </span>
                </div>

                {treatment.description && (
                    <p className="text-[13px] text-gray-500 leading-relaxed mt-1">{treatment.description}</p>
                )}

                {treatment.note && (
                    <p className="text-[12px] text-red-600 italic mt-1 bg-red-50/50 px-2 py-1 rounded inline-block border border-red-100">
                        {treatment.note}
                    </p>
                )}
            </div>

            {/* Cột giữa: Đơn giá */}
            <div className="text-[13px] font-semibold text-gray-700 min-w-[100px] text-right md:text-center self-end md:self-auto py-1">
                {((treatment.unit_price || 0) * (treatment.quantity || 1)).toLocaleString('vi-VN')}đ
            </div>

            {/* Cột phải: Thao tác */}
            <div className="flex items-center justify-end gap-2 flex-shrink-0 min-w-[160px]">
                {treatment.status === 'WAITING_APPROVAL' ? (
                    <>
                        <button
                            onClick={() => onApprove(treatment._id || treatment.id)}
                            disabled={isProcessing}
                            className="bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white text-[12px] font-medium px-3.5 py-1.5 rounded-lg transition-colors"
                        >
                            Phê duyệt
                        </button>
                        <button
                            onClick={() => onReject(treatment._id || treatment.id)}
                            disabled={isProcessing}
                            className="bg-white hover:bg-red-50 disabled:opacity-50 border border-red-200 text-red-600 text-[12px] font-medium px-3.5 py-1.5 rounded-lg transition-colors"
                        >
                            Từ chối
                        </button>
                    </>
                ) : (
                    <span className="text-[12px] text-gray-400 italic px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                        Đã xử lý
                    </span>
                )}
            </div>
        </div>
    );
};

export default TreatmentItem;
