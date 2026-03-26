import { useState, useEffect, useMemo } from 'react';
import Toast from '../../components/ui/Toast';
import appointmentService from '../../services/appointmentService';

// Sub-components
import AppointmentHeader from './components/appointments/AppointmentHeader';
import PendingAppointmentsBanner from './components/appointments/PendingAppointmentsBanner';
import AppointmentFilters from './components/appointments/AppointmentFilters';
import AppointmentList from './components/appointments/AppointmentList';

// Modals
import ConfirmAppointmentModal from './components/modals/ConfirmAppointmentModal';
import CancelAppointmentModal from './components/modals/CancelAppointmentModal';
import RescheduleAppointmentModal from './components/modals/RescheduleAppointmentModal';
import ContactPatientModal from './components/modals/ContactPatientModal';
import BookAppointmentModal from './components/modals/BookAppointmentModal';
import ViewAppointmentDetailsModal from './components/modals/ViewAppointmentDetailsModal';

const ReceptionistAppointments = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(todayStr);
    const [filterStatus, setFilterStatus] = useState('all');

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, type: '', message: '' });

    // Pending appointments banner state
    const [pendingAppointments, setPendingAppointments] = useState([]);
    const [showPendingBanner, setShowPendingBanner] = useState(true);

    // Modal states
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [showBookModal, setShowBookModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

    // --- FETCH DATA ---
    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const response = await appointmentService.getStaffAppointments({
                page: 1,
                limit: 1000
            });
            const data = response?.data?.data || response?.data || [];
            const list = Array.isArray(data) ? data : data.data || [];
            setAppointments(list);

            const pending = list.filter(a => a.status === 'PENDING_CONFIRMATION');
            setPendingAppointments(pending);
            if (pending.length > 0) setShowPendingBanner(true);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            setToast({ show: true, type: 'error', message: '❌ Lỗi khi tải danh sách lịch hẹn!' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    // --- FILTER ---
    const filteredAppointments = useMemo(() => {
        return appointments.filter(apt => {
            const aptDateStr = apt.appointment_date ? new Date(apt.appointment_date).toISOString().split('T')[0] : '';
            const matchesDate = aptDateStr === selectedDate;
            const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
            return matchesDate && matchesStatus;
        });
    }, [appointments, selectedDate, filterStatus]);

    // --- MODAL HANDLERS ---
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
        setShowBookModal(false);
        setShowDetailsModal(false);
        setSelectedAppointment(null);
        setSelectedAppointmentId(null);
    };

    const handleViewDetails = (apt) => {
        setSelectedAppointmentId(apt._id);
        setShowDetailsModal(true);
    };

    // --- API HANDLERS ---
    const handleBookAppointment = async (data) => {
        try {
            await appointmentService.createAppointment(data);
            setToast({ show: true, type: 'success', message: 'Đặt lịch thành công!' });
            closeModals();
            fetchAppointments();
        } catch (error) {
            console.error('Error creating appointment:', error);
            setToast({ show: true, type: 'error', message: error?.response?.data?.message || 'Lỗi khi đặt lịch!' });
        }
    };

    const handleConfirmAppointment = async (appointmentId, status = 'CHECKED_IN') => {
        try {
            await appointmentService.updateAppointmentStatus(appointmentId, status);
            const successMsg = status === 'CHECKED_IN' ? 'Đã xác nhận bệnh nhân đến!' : 'Đã xác nhận lịch hẹn mới!';
            setToast({ show: true, type: 'success', message: successMsg });
            closeModals();
            fetchAppointments();
        } catch (error) {
            console.error('Error confirming appointment:', error);
            setToast({ show: true, type: 'error', message: 'Lỗi xác nhận!' });
        }
    };

    const handleRejectPendingUpdate = async (appointmentId) => {
        try {
            await appointmentService.cancelAppointment(appointmentId);
            setToast({ show: true, type: 'success', message: 'Đã từ chối yêu cầu đổi lịch. Bệnh nhân đã được thông báo!' });
            fetchAppointments();
        } catch (error) {
            console.error('Error rejecting appointment:', error);
            setToast({ show: true, type: 'error', message: 'Lỗi khi từ chối!' });
        }
    };

    const handleCancelAppointment = async (appointmentId, reason) => {
        try {
            await appointmentService.cancelAppointment(appointmentId);
            setToast({ show: true, type: 'success', message: 'Đã hủy lịch hẹn!' });
            closeModals();
            fetchAppointments();
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            setToast({ show: true, type: 'error', message: 'Lỗi hủy lịch!' });
        }
    };

    const handleRescheduleAppointment = async (appointmentId, data) => {
        try {
            await appointmentService.updateAppointment(appointmentId, data);
            setToast({ show: true, type: 'success', message: 'Đã đổi lịch thành công!' });
            closeModals();
            fetchAppointments();
        } catch (error) {
            console.error('Error rescheduling appointment:', error);
            setToast({ show: true, type: 'error', message: error?.response?.data?.message || 'Lỗi đổi lịch!' });
        }
    };

    return (
        <div>
            {/* Header */}
            <AppointmentHeader
                loading={loading}
                onRefresh={fetchAppointments}
            />

            {/* Banner for pending confirmation */}
            <PendingAppointmentsBanner
                pendingAppointments={pendingAppointments}
                showBanner={showPendingBanner}
                onHide={() => setShowPendingBanner(false)}
                onConfirm={handleConfirmAppointment}
                onReject={handleRejectPendingUpdate}
            />

            {/* Filters */}
            <AppointmentFilters
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                onBookNew={() => setShowBookModal(true)}
            />

            {/* Appointments List */}
            <AppointmentList
                appointments={filteredAppointments}
                loading={loading}
                onConfirm={handleConfirmClick}
                onCancel={handleCancelClick}
                onContact={handleContactClick}
                onReschedule={handleRescheduleClick}
                onViewDetails={handleViewDetails}
                onConfirmNew={handleConfirmAppointment}
            />

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
            <ViewAppointmentDetailsModal
                appointmentId={selectedAppointmentId}
                isOpen={showDetailsModal}
                onClose={closeModals}
            />
            <ContactPatientModal
                appointment={selectedAppointment}
                isOpen={showContactModal}
                onClose={closeModals}
            />
            <BookAppointmentModal
                isOpen={showBookModal}
                onClose={closeModals}
                onBook={handleBookAppointment}
            />

            <Toast
                show={toast.show}
                type={toast.type}
                message={toast.message}
                onClose={() => setToast({ ...toast, show: false })}
            />
        </div>
    );
};

export default ReceptionistAppointments;
