import { Phone, Calendar, Eye, CheckCircle, XCircle } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import StatusBadge from './StatusBadge';

const AppointmentItem = ({
    appointment,
    onContact,
    onReschedule,
    onViewDetails,
}) => {
    return (
        <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                    {/* Time */}
                    <div className="bg-primary-100 p-4 rounded-lg text-center min-w-[80px]">
                        <div className="text-xs text-primary-600 font-medium">Giờ</div>
                        <div className="text-lg font-bold text-primary-700">{appointment.appointment_time}</div>
                    </div>

                    {/* Patient Info */}
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{appointment.full_name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <Phone size={14} />
                            {appointment.phone}
                        </div>
                        <p className="text-sm text-gray-700 mt-2">
                            <span className="font-medium">Lý do:</span> {appointment.reason || 'Không rõ'}
                        </p>
                    </div>

                    {/* Status Badge */}
                    <div>
                        <StatusBadge status={appointment.status} />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 ml-4">
                    <button
                        onClick={() => onContact(appointment)}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Liên hệ"
                    >
                        <Phone size={20} />
                    </button>
                    <button
                        onClick={() => onReschedule(appointment)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Đổi lịch"
                    >
                        <Calendar size={20} />
                    </button>
                    <button
                        onClick={() => onViewDetails(appointment)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Xem chi tiết"
                    >
                        <Eye size={20} />
                    </button>
                </div>
            </div>
        </Card>
    );
};

export default AppointmentItem;
