const statusConfig = {
    PLANNED: { label: 'Đã lên kế hoạch', style: 'bg-blue-50 text-blue-700 border-blue-200' },
    WAITING_APPROVAL: { label: 'Chờ phê duyệt', style: 'bg-amber-50 text-amber-700 border-amber-200' },
    APPROVED: { label: 'Đã phê duyệt', style: 'bg-teal-50 text-teal-700 border-teal-200' },
    REJECTED: { label: 'Từ chối', style: 'bg-red-50 text-red-600 border-red-200' },
    IN_PROGRESS: { label: 'Đang thực hiện', style: 'bg-purple-50 text-purple-700 border-purple-200' },
    DONE: { label: 'Hoàn thành', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    CANCELLED: { label: 'Đã hủy', style: 'bg-gray-100 text-gray-500 border-gray-200' },
};

const phaseConfig = {
    PLAN: { label: 'Kế hoạch', style: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    SESSION: { label: 'Điều trị', style: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
};

const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

/**
 * TreatmentDetailModal
 * Modal hiển thị chi tiết 1 phiếu điều trị, bao gồm đơn thuốc nếu có.
 */
const TreatmentDetailModal = ({ treatment, onClose }) => {
    if (!treatment) return null;

    const ts = statusConfig[treatment.status] || { label: treatment.status, style: 'bg-gray-100 text-gray-500 border-gray-200' };
    const ph = phaseConfig[treatment.phase] || { label: treatment.phase, style: 'bg-gray-50 text-gray-500 border-gray-200' };
    const medicines = treatment.medicine_usage || [];
    const hasMedicines = medicines.length > 0;

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
            onClick={onClose}
        >
            {/* Modal Box */}
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-gray-100">
                    <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-lg font-bold text-gray-900">
                                Chi Tiết Phiếu Điều Trị
                            </h2>
                            <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${ts.style}`}>
                                {ts.label}
                            </span>
                            <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${ph.style}`}>
                                {ph.label}
                            </span>
                        </div>
                        {treatment.tooth_position && (
                            <p className="text-sm text-gray-500">
                                Vị trí răng: <span className="font-semibold text-gray-700">{treatment.tooth_position}</span>
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-4 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors font-bold text-lg"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <InfoField label="Bác sĩ thực hiện" value={treatment.doctor_info?.full_name ? `BS ${treatment.doctor_info.full_name}` : '—'} />
                        <InfoField label="Số lượng" value={treatment.quantity != null ? treatment.quantity : '—'} />
                        <InfoField label="Ngày lên kế hoạch" value={formatDate(treatment.planned_date)} />
                    </div>

                    {/* Result */}
                    {treatment.result && (
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Kết quả điều trị</p>
                            <p className="text-sm text-gray-700 bg-emerald-50/60 border border-emerald-100 rounded-xl px-4 py-3 leading-relaxed">
                                {treatment.result}
                            </p>
                        </div>
                    )}

                    {/* Note */}
                    {treatment.note && (
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Ghi chú</p>
                            <p className="text-sm text-gray-600 bg-amber-50/50 border border-amber-100 rounded-xl px-4 py-3 leading-relaxed italic">
                                {treatment.note}
                            </p>
                        </div>
                    )}

                    {/* Medicine / Prescription */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Đơn Thuốc
                            </p>
                            {hasMedicines && (
                                <span className="text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 rounded-full">
                                    {medicines.length} loại thuốc
                                </span>
                            )}
                        </div>

                        {!hasMedicines ? (
                            <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl">
                                <p className="text-2xl mb-2 opacity-40">💊</p>
                                <p className="text-sm text-gray-400">Không có đơn thuốc cho phiếu này</p>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-gray-100 overflow-hidden">
                                {/* Table header */}
                                <div className="grid grid-cols-[1fr_60px_1fr_80px] gap-2 bg-gray-50 px-4 py-2.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                                    <span>Thuốc</span>
                                    <span className="text-center">SL</span>
                                    <span>Cách dùng</span>
                                    <span className="text-center">Đã phát</span>
                                </div>
                                {/* Rows */}
                                {medicines.map((med, idx) => {
                                    const medName = med.medicine_id?.name || med.medicine_id?.medicine_name || `Thuốc #${idx + 1}`;
                                    return (
                                        <div
                                            key={med._id || idx}
                                            className={`grid grid-cols-[1fr_60px_1fr_80px] gap-2 px-4 py-3 text-sm border-b border-gray-50 last:border-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}
                                        >
                                            <div>
                                                <p className="font-medium text-gray-800">{medName}</p>
                                                {med.note && (
                                                    <p className="text-xs text-gray-400 mt-0.5 italic">{med.note}</p>
                                                )}
                                            </div>
                                            <div className="text-center font-semibold text-teal-700">
                                                {med.quantity}
                                            </div>
                                            <div className="text-gray-600 text-xs leading-relaxed">
                                                {med.usage_instruction || '—'}
                                            </div>
                                            <div className="text-center">
                                                {med.dispensed ? (
                                                    <span className="text-emerald-600 text-xs font-semibold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">✓ Đã phát</span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">Chưa</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

/** Helper: một ô thông tin trong lưới */
const InfoField = ({ label, value, highlight }) => (
    <div className="space-y-0.5">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className={`text-sm font-medium ${highlight ? 'text-teal-700 font-bold text-base' : 'text-gray-800'}`}>
            {value}
        </p>
    </div>
);

export default TreatmentDetailModal;
