import { useState } from 'react';
import { Calendar, Clock, Search, Plus, CheckCircle, XCircle, Phone } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { mockAppointments } from '../../utils/mockData';
import ConfirmAppointmentModal from './components/modals/ConfirmAppointmentModal';
import CancelAppointmentModal from './components/modals/CancelAppointmentModal';
import RescheduleAppointmentModal from './components/modals/RescheduleAppointmentModal';
import ContactPatientModal from './components/modals/ContactPatientModal';

const ReceptionistAppointments = () => {
    const [selectedDate, setSelectedDate] = useState('2026-01-15');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);

    const filteredAppointments = mockAppointments.filter(apt => {
        const matchesDate = apt.date === selectedDate;
        const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
        return matchesDate && matchesStatus;
    });

    const getStatusVariant = (status) => {
        switch (status) {
            case 'Confirmed': return 'success';
            case 'Pending': return 'warning';
            case 'Completed': return 'primary';
            case 'Cancelled': return 'danger';
            default: return 'default';
        }
    };

    const handleConfirmClick = (appointment) => {
        setSelectedAppointment(appointment);
        setShowConfirmModal(true);
    };

    const handleCancelClick = (appointment) => {
        setSelectedAppointment(appointment);
        setShowCancelModal(true);
    };

    const handleRescheduleClick = (appointment) => {
        setSelectedAppointment(appointment);
        setShowRescheduleModal(true);
    };

    const handleContactClick = (appointment) => {
        setSelectedAppointment(appointment);
        setShowContactModal(true);
    };

    const closeModals = () => {
        setShowConfirmModal(false);
        setShowCancelModal(false);
        setShowRescheduleModal(false);
        setShowContactModal(false);
        setSelectedAppointment(null);
    };

    const handleConfirmAppointment = (appointmentId) => {
        // TODO: Call API to confirm
        console.log('Confirmed appointment:', appointmentId);
    };

    const handleCancelAppointment = (appointmentId, reason) => {
        // TODO: Call API to cancel
        console.log('Cancelled appointment:', appointmentId, reason);
    };

    const handleRescheduleAppointment = (appointmentId, data) => {
        // TODO: Call API to reschedule
        console.log('Rescheduled appointment:', appointmentId, data);
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Quản Lý Lịch Hẹn</h1>
                <p className="text-gray-600 mt-1">Đặt lịch và theo dõi cuộc hẹn</p>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Date Filter */}
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Chọn ngày
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Trạng thái
                        </label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">Tất cả</option>
                            <option value="Pending">Chờ xác nhận</option>
                            <option value="Confirmed">Đã xác nhận</option>
                            <option value="Completed">Hoàn thành</option>
                            <option value="Cancelled">Đã hủy</option>
                        </select>
                    </div>

                    {/* Add Button */}
                    <div className="flex items-end">
                        <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2">
                            <Plus size={20} />
                            Đặt lịch mới
                        </button>
                    </div>
                </div>
            </Card>

            {/* Appointments Grid */}
            <div className="grid grid-cols-1 gap-4">
                {filteredAppointments.length > 0 ? (
                    filteredAppointments.map((apt) => (
                        <Card key={apt.id} className="hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                    {/* Time */}
                                    <div className="bg-primary-100 p-4 rounded-lg text-center min-w-[80px]">
                                        <div className="text-xs text-primary-600 font-medium">Giờ</div>
                                        <div className="text-lg font-bold text-primary-700">{apt.time}</div>
                                    </div>

                                    {/* Patient Info */}
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900">{apt.patientName}</h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                            <Phone size={14} />
                                            {apt.patientPhone}
                                        </div>
                                        <p className="text-sm text-gray-700 mt-2">
                                            <span className="font-medium">Lý do:</span> {apt.reason}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            <span className="font-medium">Bác sĩ:</span> {apt.doctorName}
                                        </p>
                                    </div>

                                    {/* Status Badge */}
                                    <div>
                                        <Badge variant={getStatusVariant(apt.status)}>
                                            {apt.status}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 ml-4">
                                    {apt.status === 'Pending' && (
                                        <>
                                            <button
                                                onClick={() => handleConfirmClick(apt)}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                title="Xác nhận"
                                            >
                                                <CheckCircle size={20} />
                                            </button>
                                            <button
                                                onClick={() => handleCancelClick(apt)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Hủy"
                                            >
                                                <XCircle size={20} />
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => handleContactClick(apt)}
                                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                        title="Liên hệ"
                                    >
                                        <Phone size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleRescheduleClick(apt)}
                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                        title="Đổi lịch"
                                    >
                                        <Calendar size={20} />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <Card>
                        <div className="text-center py-12">
                            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">Không có lịch hẹn nào trong ngày này</p>
                        </div>
                    </Card>
                )}
            </div>

            {/* Modals */}
            <ConfirmAppointmentModal
                appointment={selectedAppointment}
                isOpen={showConfirmModal}
                onClose={closeModals}
                onConfirm={handleConfirmAppointment}
            />
            <CancelAppointmentModal
                appointment={selectedAppointment}
                isOpen={showCancelModal}
                onClose={closeModals}
                onConfirm={handleCancelAppointment}
            />
            <RescheduleAppointmentModal
                appointment={selectedAppointment}
                isOpen={showRescheduleModal}
                onClose={closeModals}
                onReschedule={handleRescheduleAppointment}
            />
            <ContactPatientModal
                appointment={selectedAppointment}
                isOpen={showContactModal}
                onClose={closeModals}
            />
        </div>
    );
};

export default ReceptionistAppointments;
