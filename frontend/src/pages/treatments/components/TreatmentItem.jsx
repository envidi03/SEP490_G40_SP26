import { CheckCircle, XCircle, Clock } from 'lucide-react';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';

const statusConfig = {
    PENDING: { label: 'Chờ phê duyệt', variant: 'warning', icon: Clock },
    APPROVED: { label: 'Đã duyệt', variant: 'success', icon: CheckCircle },
    REJECTED: { label: 'Từ chối', variant: 'danger', icon: XCircle },
};

/**
 * TreatmentItem - Renders a single treatment row with approve/reject controls
 */
const TreatmentItem = ({ treatment, onApprove, onReject }) => {
    const ts = statusConfig[treatment.status] || { label: treatment.status, variant: 'default', icon: Clock };
    const TsIcon = ts.icon;

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 py-4 border-b border-gray-100 last:border-0">
            {/* Left: treatment info */}
            <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-900 text-sm">{treatment.treatment_name}</p>
                    <Badge variant={ts.variant} className="text-xs">
                        <TsIcon size={12} className="inline mr-1" />
                        {ts.label}
                    </Badge>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{treatment.description}</p>
                {treatment.note && (
                    <p className="text-xs text-orange-600 italic">📌 {treatment.note}</p>
                )}
            </div>

            {/* Middle: price */}
            <div className="text-sm font-semibold text-gray-700 min-w-[100px] text-right md:text-center">
                {(treatment.unit_price * treatment.quantity).toLocaleString('vi-VN')}đ
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
                {treatment.status === 'PENDING' ? (
                    <>
                        <Button
                            onClick={() => onApprove(treatment.id)}
                            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-lg"
                        >
                            <CheckCircle size={14} />
                            Phê duyệt
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => onReject(treatment.id)}
                            className="flex items-center gap-1.5 text-red-600 border-red-300 hover:bg-red-50 bg-transparent text-xs px-3 py-1.5 rounded-lg"
                        >
                            <XCircle size={14} />
                            Từ chối
                        </Button>
                    </>
                ) : (
                    <span className="text-xs text-gray-400 italic px-3">Đã xử lý</span>
                )}
            </div>
        </div>
    );
};

export default TreatmentItem;
