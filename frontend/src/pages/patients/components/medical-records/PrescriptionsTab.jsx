import React from 'react';
import { Pill, CheckCircle2, AlertCircle, Calendar, MapPin } from 'lucide-react';

const PrescriptionsTab = ({ treatments }) => {
    // Lọc ra các treatment có sử dụng thuốc
    const treatmentsWithMeds = (treatments || []).filter(
        t => t.medicine_usage && t.medicine_usage.length > 0
    );

    if (treatmentsWithMeds.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <Pill size={36} className="mx-auto mb-2 text-gray-300" />
                <p>Không có đơn thuốc nào trong hồ sơ này.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {treatmentsWithMeds.map((t, idx) => {
                const dateToShow = t.performed_date || t.planned_date;
                const formattedDate = dateToShow
                    ? new Date(dateToShow).toLocaleDateString('vi-VN')
                    : 'Chưa xác định ngày';

                return (
                    <div key={t._id || idx} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        {/* Header của đợt cấp thuốc */}
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                                    <Calendar size={16} className="text-primary-600" />
                                    <span>
                                        {t.phase === 'SESSION' ? 'Điều trị ngày: ' : 'Dự kiến ngày: '}
                                        {formattedDate}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                                    <MapPin size={15} />
                                    <span>Vị trí: {t.tooth_position || 'Toàn hàm'}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                <Pill size={15} />
                                <span>{t.medicine_usage.length} loại thuốc</span>
                            </div>
                        </div>

                        {/* Bảng thuốc của đợt này */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-0">
                                <thead className="bg-white border-b border-gray-100">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-semibold text-gray-600 w-12">#</th>
                                        <th className="px-4 py-2 text-left font-semibold text-gray-600">Tên thuốc</th>
                                        <th className="px-4 py-2 text-center font-semibold text-gray-600 w-24">Số lượng</th>
                                        <th className="px-4 py-2 text-left font-semibold text-gray-600">Hướng dẫn sử dụng</th>
                                        <th className="px-4 py-2 text-left font-semibold text-gray-600">Ghi chú</th>
                                        <th className="px-4 py-2 text-center font-semibold text-gray-600 w-32">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {t.medicine_usage.map((med, i) => (
                                        <tr key={i} className={`border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors`}>
                                            <td className="px-4 py-2.5 text-gray-500">{i + 1}</td>
                                            <td className="px-4 py-2.5 font-medium text-gray-800">
                                                {med.medicine_id?.medicine_name || med.medicine_id?.name || `Thuốc #${i + 1}`}
                                            </td>
                                            <td className="px-4 py-2.5 text-center text-gray-700 font-medium bg-gray-50/50">{med.quantity}</td>
                                            <td className="px-4 py-2.5 text-gray-600">{med.usage_instruction || '—'}</td>
                                            <td className="px-4 py-2.5 text-gray-500 italic text-xs">{med.note || '—'}</td>
                                            <td className="px-4 py-2.5 text-center">
                                                {med.dispensed ? (
                                                    <span className="inline-flex items-center justify-center gap-1 text-green-700 bg-green-50 px-2.5 py-1 rounded-full text-xs font-semibold border border-green-100">
                                                        <CheckCircle2 size={13} /> Đã cấp
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center justify-center gap-1 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full text-xs font-semibold border border-amber-100">
                                                        <AlertCircle size={13} /> Chưa cấp
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default PrescriptionsTab;
