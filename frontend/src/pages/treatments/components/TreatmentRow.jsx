import Badge from '../../../components/ui/Badge';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

const statusConfig = {
    PENDING: { label: 'Chờ phê duyệt', variant: 'warning', icon: Clock },
    APPROVED: { label: 'Đã duyệt', variant: 'success', icon: CheckCircle },
    REJECTED: { label: 'Từ chối', variant: 'danger', icon: XCircle },
};

/**
 * TreatmentRow – Hiển thị 1 dòng phiếu điều trị (chỉ xem, không có thao tác)
 */
const TreatmentRow = ({ treatment, index }) => {
    const ts = statusConfig[treatment.status] || { label: treatment.status, variant: 'default', icon: Clock };
    const TsIcon = ts.icon;

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 py-3.5 border-b border-gray-100 last:border-0">
            {/* Index + name + description */}
            <div className="flex gap-3 flex-1 min-w-0">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center mt-0.5">
                    {index + 1}
                </span>
                <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{treatment.treatment_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{treatment.description}</p>
                    {treatment.note && (
                        <p className="text-xs text-orange-500 italic mt-0.5">📌 {treatment.note}</p>
                    )}
                </div>
            </div>

            {/* Price */}
            <div className="text-sm font-semibold text-gray-700 flex-shrink-0 min-w-[110px] text-right">
                {(treatment.unit_price * treatment.quantity).toLocaleString('vi-VN')}đ
            </div>

            {/* Status badge */}
            <div className="flex-shrink-0">
                <Badge variant={ts.variant} className="text-xs whitespace-nowrap">
                    <TsIcon size={12} className="inline mr-1" />
                    {ts.label}
                </Badge>
            </div>
        </div>
    );
};

export default TreatmentRow;
