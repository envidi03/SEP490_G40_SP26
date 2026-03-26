import { Calendar, Loader2 } from 'lucide-react';
import Card from '../../../../components/ui/Card';
import AppointmentItem from './AppointmentItem';

const AppointmentList = ({
    appointments,
    loading,
    onConfirm,
    onCancel,
    onContact,
    onReschedule,
    onViewDetails,
    onConfirmNew
}) => {
    if (loading) {
        return (
            <Card>
                <div className="text-center py-16">
                    <Loader2 size={40} className="mx-auto text-primary-500 animate-spin mb-4" />
                    <p className="text-gray-500">Đang tải lịch hẹn...</p>
                </div>
            </Card>
        );
    }

    if (appointments.length === 0) {
        return (
            <Card>
                <div className="text-center py-12">
                    <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Không có lịch hẹn nào trong ngày này</p>
                </div>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4">
            {appointments.map((apt) => (
                <AppointmentItem
                    key={apt._id}
                    appointment={apt}
                    onConfirm={onConfirm}
                    onCancel={onCancel}
                    onContact={onContact}
                    onReschedule={onReschedule}
                    onViewDetails={onViewDetails}
                    onConfirmNew={onConfirmNew}
                />
            ))}
        </div>
    );
};

export default AppointmentList;
