const statusConfig = {
    PENDING: { label: 'Chờ phê duyệt', style: 'bg-amber-50 text-amber-600 border-amber-200' },
    APPROVED: { label: 'Đã duyệt', style: 'bg-teal-50 text-teal-600 border-teal-200' },
    REJECTED: { label: 'Từ chối', style: 'bg-red-50 text-red-500 border-red-200' },
};

/**
 * TreatmentRow – Hiển thị 1 dòng phiếu điều trị (minimalist UI)
 */
const TreatmentRow = ({ treatment, index }) => {
    const ts = statusConfig[treatment.status] || { label: treatment.status, style: 'bg-gray-50 text-gray-500 border-gray-200' };

    return (
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors px-2 rounded-xl">
            {/* Index + name + description */}
            <div className="flex gap-4 flex-1 min-w-0">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-50 text-teal-600 text-xs font-semibold flex items-center justify-center mt-0.5 border border-teal-100">
                    {index + 1}
                </span>
                <div className="min-w-0 space-y-1">
                    <p className="font-semibold text-gray-800 text-sm truncate">{treatment.treatment_name}</p>
                    {treatment.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                            {treatment.description}
                        </p>
                    )}
                    {treatment.note && (
                        <p className="text-xs text-gray-400 italic bg-white border border-gray-100 px-2 py-1 rounded-lg inline-block mt-1">
                            Ghi chú: {treatment.note}
                        </p>
                    )}
                </div>
            </div>

            {/* Price & Status container */}
            <div className="flex items-center md:flex-col md:items-end gap-3 justify-between md:justify-start flex-shrink-0 md:pl-4">
                <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${ts.style}`}>
                    {ts.label}
                </span>
                <div className="text-sm font-semibold text-gray-700">
                    {(treatment.unit_price * treatment.quantity).toLocaleString('vi-VN')}đ
                </div>
            </div>
        </div>
    );
};

export default TreatmentRow;
