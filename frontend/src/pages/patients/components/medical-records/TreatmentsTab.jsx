import React from 'react';
import { Clock, DollarSign, Eye, Stethoscope, Pill, CheckCircle2, AlertCircle } from 'lucide-react';
import { getStatusBadge, formatCurrency } from './statusHelpers';

const TreatmentsTab = ({ treatments, onViewDetail }) => {
    const sessions = (treatments || []).filter(t => t.phase === 'SESSION' || (t.phase !== 'PLAN' && t.status !== 'PLANNED'));

    if (sessions.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <Stethoscope size={36} className="mx-auto mb-2 text-gray-300" />
                <p>Chưa có buổi điều trị nào được thực hiện.</p>
            </div>
        );
    }

    return (
        <div className="relative pl-6 border-l-2 border-primary-200 space-y-6">
            {sessions.map((t, idx) => (
                <div key={t._id || idx} className="relative">
                    {/* Timeline dot */}
                    <div className={`absolute -left-[29px] top-1 w-4 h-4 rounded-full border-2 border-white shadow ${t.status === 'DONE' ? 'bg-green-500' : t.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-gray-400'
                        }`} />

                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-4 flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className="font-semibold text-gray-800">{t.tooth_position || 'Toàn hàm'}</span>
                                    {getStatusBadge(t.status)}
                                </div>
                                <div className="text-sm text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
                                    {t.performed_date && (
                                        <span className="flex items-center gap-1">
                                            <Clock size={13} /> {new Date(t.performed_date).toLocaleDateString('vi-VN')}
                                        </span>
                                    )}
                                    {t.planned_price != null && (
                                        <span className="flex items-center gap-1">
                                            <DollarSign size={13} />
                                            {formatCurrency(t.planned_price)}
                                        </span>
                                    )}
                                </div>
                                {t.result && <p className="text-sm text-gray-600 mt-1">Kết quả: {t.result}</p>}
                                {t.note && <p className="text-xs text-gray-400 mt-1 italic line-clamp-1">— {t.note}</p>}
                            </div>
                            <button
                                onClick={() => onViewDetail(t)}
                                className="flex-shrink-0 px-3 py-1.5 text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors text-sm font-medium flex items-center gap-1"
                            >
                                <Eye size={14} /> Chi tiết
                            </button>
                        </div>

                        {/* Prescriptions (Medicine Usage) */}
                        {t.medicine_usage && t.medicine_usage.length > 0 && (
                            <div className="bg-blue-50/50 border-t border-gray-100 p-4">
                                <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-primary-700">
                                    <Pill size={16} />
                                    <span>Đơn thuốc đã cấp ({t.medicine_usage.length} loại)</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm border-0">
                                        <thead className="bg-white/60 border-b border-blue-100/50">
                                            <tr>
                                                <th className="px-3 py-2 text-left font-medium text-gray-600">Tên thuốc</th>
                                                <th className="px-3 py-2 text-center font-medium text-gray-600 w-20">SL</th>
                                                <th className="px-3 py-2 text-left font-medium text-gray-600">HD sử dụng</th>
                                                <th className="px-3 py-2 text-center font-medium text-gray-600 w-28">Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {t.medicine_usage.map((med, i) => (
                                                <tr key={i} className="border-b border-blue-50/50 last:border-0 hover:bg-white/50 transition-colors">
                                                    <td className="px-3 py-2 font-medium text-gray-800">
                                                        {med.medicine_id?.medicine_name || med.medicine_id?.name || `Thuốc #${i + 1}`}
                                                    </td>
                                                    <td className="px-3 py-2 text-center text-gray-700 font-medium">{med.quantity}</td>
                                                    <td className="px-3 py-2 text-gray-600 text-xs">{med.usage_instruction || '—'}</td>
                                                    <td className="px-3 py-2 text-center">
                                                        {med.dispensed ? (
                                                            <span className="inline-flex items-center gap-1 text-green-700 text-[11px] font-semibold">
                                                                <CheckCircle2 size={12} /> Đã cấp
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-amber-700 text-[11px] font-semibold">
                                                                <AlertCircle size={12} /> Chưa cấp
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TreatmentsTab;
