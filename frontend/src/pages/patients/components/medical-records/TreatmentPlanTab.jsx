import React from 'react';
import { Calendar, DollarSign, Eye, ListChecks } from 'lucide-react';
import { getStatusBadge, formatCurrency } from './statusHelpers';

const TreatmentPlanTab = ({ treatments, onViewDetail }) => {
    const plans = (treatments || []).filter(t => t.phase === 'PLAN' || t.status === 'PLANNED');

    if (plans.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <ListChecks size={36} className="mx-auto mb-2 text-gray-300" />
                <p>Chưa có kế hoạch điều trị nào được lập.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {plans.map((t, idx) => (
                <div key={t._id || idx} className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-800 truncate">{t.tooth_position || 'Toàn hàm'}</span>
                            {getStatusBadge(t.status)}
                        </div>
                        <div className="text-sm text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
                            {t.planned_date && (
                                <span className="flex items-center gap-1">
                                    <Calendar size={13} /> Dự kiến: {new Date(t.planned_date).toLocaleDateString('vi-VN')}
                                </span>
                            )}
                            {t.planned_price != null && (
                                <span className="flex items-center gap-1">
                                    <DollarSign size={13} />
                                    {formatCurrency(t.planned_price)}
                                </span>
                            )}
                        </div>
                        {t.note && <p className="text-xs text-gray-400 mt-1 italic line-clamp-1">— {t.note}</p>}
                    </div>
                    <button
                        onClick={() => onViewDetail(t)}
                        className="ml-3 flex-shrink-0 px-3 py-1.5 text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors text-sm font-medium flex items-center gap-1"
                    >
                        <Eye size={14} /> Chi tiết
                    </button>
                </div>
            ))}
        </div>
    );
};

export default TreatmentPlanTab;
