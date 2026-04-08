import { useState, useEffect } from 'react';
import Toast from '../../components/ui/Toast';
import appointmentService from '../../services/appointmentService';
import SharedPagination from '../../components/ui/SharedPagination';

// Sub-components
import AppointmentHeader from './components/appointments/AppointmentHeader';
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
    const [selectedDate, setSelectedDate] = useState();
    const [filterStatus, setFilterStatus] = useState('all');

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 6;

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, type: '', message: '' });

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
            const queryParams = {
                page: currentPage,
                limit: itemsPerPage,
                appointment_date: selectedDate,
                exclude_status: 'PENDING_CONFIRMATION'
            };

            if (filterStatus && filterStatus !== 'all') {
                queryParams.status = filterStatus;
            }

            const response = await appointmentService.getStaffAppointments(queryParams);

            let list = [];
            let paginationData = null;

            if (response) {
                if (Array.isArray(response.data?.data)) {
                    list = response.data.data;
                } else if (Array.isArray(response.data)) {
                    list = response.data;
                } else if (Array.isArray(response)) {
                    list = response;
                }
                paginationData = response.pagination || response.data?.pagination;
            }

            setAppointments(list);

            if (paginationData) {
                setTotalItems(paginationData.totalItems || 0);
                const size = paginationData.size || itemsPerPage;
                setTotalPages(Math.ceil((paginationData.totalItems || 0) / size) || 1);
            } else {
                setTotalItems(list.length);
                setTotalPages(1);
            }

        } catch (error) {
            console.error('Error fetching appointments:', error);
            setToast({ show: true, type: 'error', message: 'Lỗi khi tải danh sách lịch hẹn!' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [currentPage, selectedDate, filterStatus]);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedDate, filterStatus]);

    // Dữ liệu đã được API lọc và phân trang từ Backend
    const paginatedAppointments = appointments;

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
            const successMsg = status === 'CHECKED_IN' ? 'Đã xác nhận bệnh nhân đến!' : 'Đã xác nhận lịch hẹn!';
            setToast({ show: true, type: 'success', message: successMsg });
            closeModals();
            fetchAppointments();
        } catch (error) {
            console.error('Error confirming appointment:', error);
            setToast({ show: true, type: 'error', message: 'Lỗi xác nhận!' });
        }
    };

    const handleCancelAppointment = async (appointmentId) => {
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

            {/* Filters */}
            <AppointmentFilters
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
            />

            {/* Appointments List */}
            <AppointmentList
                appointments={paginatedAppointments}
                loading={loading}
                onConfirm={handleConfirmClick}
                onCancel={handleCancelClick}
                onContact={handleContactClick}
                onReschedule={handleRescheduleClick}
                onViewDetails={handleViewDetails}
                onConfirmNew={handleConfirmAppointment}
            />

            {/* Pagination Component */}
            {appointments.length > 0 && !loading && (
                <div className="mt-6 mb-8">
                    <SharedPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        onPageChange={setCurrentPage}
                        itemLabel="lịch hẹn"
                    />
                </div>
            )}

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
