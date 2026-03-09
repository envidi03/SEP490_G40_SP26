const treatmentStatusConfig = {
    PLANNED: { label: 'Kế hoạch', style: 'bg-gray-50 text-gray-500 border-gray-200' },
    WAITING_APPROVAL: { label: 'Chờ duyệt', style: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    APPROVED: { label: 'Đã duyệt', style: 'bg-blue-50 text-blue-700 border-blue-200' },
    REJECTED: { label: 'Từ chối', style: 'bg-red-50 text-red-500 border-red-200' },
    IN_PROGRESS: { label: 'Đang thực hiện', style: 'bg-orange-50 text-orange-700 border-orange-200' },
    DONE: { label: 'Hoàn thành', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    CANCELLED: { label: 'Đã hủy', style: 'bg-gray-100 text-gray-400 border-gray-200' },
};

const phaseLabel = { PLAN: 'Kế hoạch', SESSION: 'Thực hiện' };

const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatPrice = (num) => {
    if (!num && num !== 0) return '—';
    return num.toLocaleString('vi-VN') + 'đ';
};

/**
 * TreatmentTable
 * Bảng danh sách phiếu điều trị của 1 hồ sơ nha khoa
 * Props: treatments – array from API
 */
const TreatmentTable = ({ treatments = [] }) => {
    if (treatments.length === 0) {
        return (
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-50">
                    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Danh sách phiếu điều trị
                        <span className="ml-2 text-gray-300 font-normal">(0)</span>
                    </h2>
                </div>
                <div className="py-16 text-center text-gray-400 text-sm">
                    Chưa có phiếu điều trị nào trong hồ sơ này
                </div>
            </div>
        );
    }

    const pendingCount = treatments.filter(t => t.status === 'WAITING_APPROVAL').length;
    const approvedCount = treatments.filter(t => t.status === 'APPROVED' || t.status === 'DONE').length;

    return (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            {/* Header + mini stats */}
            <div className="px-5 py-4 border-b border-gray-50 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Danh sách phiếu điều trị
                    <span className="ml-2 text-gray-400 font-normal normal-case">({treatments.length} phiếu)</span>
                </h2>
                <div className="flex items-center gap-3 text-xs">
                    {pendingCount > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full border bg-yellow-50 text-yellow-700 border-yellow-200">
                            {pendingCount} chờ duyệt
                        </span>
                    )}
                    {approvedCount > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                            {approvedCount} hoàn thành
                        </span>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50/50 border-b border-gray-100">
                            <th className="px-5 py-3 text-left font-medium w-8">#</th>
                            <th className="px-5 py-3 text-left font-medium">Vị trí răng</th>
                            <th className="px-5 py-3 text-left font-medium">Giai đoạn</th>
                            <th className="px-5 py-3 text-left font-medium">Ngày kế hoạch</th>
                            <th className="px-5 py-3 text-left font-medium">Ngày thực hiện</th>
                            <th className="px-5 py-3 text-right font-medium">Giá dự kiến</th>
                            <th className="px-5 py-3 text-center font-medium">Trạng thái</th>
                            <th className="px-5 py-3 text-left font-medium">Kết quả / Ghi chú</th>
                        </tr>
                    </thead>
                    <tbody>
                        {treatments.map((t, idx) => {
                            const statusInfo = treatmentStatusConfig[t.status] || {
                                label: t.status, style: 'bg-gray-100 text-gray-500 border-gray-200'
                            };
                            return (
                                <tr
                                    key={t._id}
                                    className="border-b border-gray-50 last:border-0 hover:bg-teal-50/30 transition-colors"
                                >
                                    <td className="px-5 py-3.5 text-gray-400 text-xs">{idx + 1}</td>
                                    <td className="px-5 py-3.5 font-medium text-gray-800">
                                        {t.tooth_position || '—'}
                                    </td>
                                    <td className="px-5 py-3.5 text-gray-600">
                                        {phaseLabel[t.phase] || t.phase || '—'}
                                    </td>
                                    <td className="px-5 py-3.5 text-gray-600 tabular-nums">
                                        {formatDate(t.planned_date)}
                                    </td>
                                    <td className="px-5 py-3.5 text-gray-600 tabular-nums">
                                        {formatDate(t.performed_date)}
                                    </td>
                                    <td className="px-5 py-3.5 text-right text-gray-800 font-medium tabular-nums">
                                        {formatPrice(t.planned_price)}
                                    </td>
                                    <td className="px-5 py-3.5 text-center">
                                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${statusInfo.style}`}>
                                            {statusInfo.label}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-gray-500 text-xs max-w-[180px]">
                                        <span className="line-clamp-2">
                                            {t.result || t.note || '—'}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TreatmentTable;
