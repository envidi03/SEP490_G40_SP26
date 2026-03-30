import { useState, useEffect } from 'react';
import { Clock, Search } from 'lucide-react';
import Toast from '../../components/ui/Toast';
import appointmentService from '../../services/appointmentService';
import SharedPagination from '../../components/ui/SharedPagination';

// Sub-components
import AppointmentList from './components/appointments/AppointmentList';

// Modals
import ConfirmAppointmentModal from './components/modals/ConfirmAppointmentModal';
import CancelAppointmentModal from './components/modals/CancelAppointmentModal';
import RescheduleAppointmentModal from './components/modals/RescheduleAppointmentModal';
import ContactPatientModal from './components/modals/ContactPatientModal';
import ViewAppointmentDetailsModal from './components/modals/ViewAppointmentDetailsModal';

const ReceptionistPendingAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, type: '', message: '' });

    // Filter & Pagination states
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // Modal states
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

    // --- FETCH DATA ---
    const fetchPendingAppointments = async () => {
        setLoading(true);
        try {
            // Fetch with a large limit assuming the reception will handle them
            const response = await appointmentService.getStaffAppointments({
                page: 1,
                limit: 1000
            });
            const data = response?.data?.data || response?.data || [];
            const list = Array.isArray(data) ? data : data.data || [];

            // Lọc ra các lịch hẹn đang chờ xác nhận (bất kể ngày nào)
            const pending = list.filter(a => a.status === 'PENDING_CONFIRMATION');
            setAppointments(pending);
        } catch (error) {
            console.error('Error fetching pending appointments:', error);
            setToast({ show: true, type: 'error', message: ' Lỗi khi tải danh sách lịch hẹn chờ xác nhận!' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingAppointments();
    }, []);

    // --- FILTER & PAGINATION ---
    const filteredAppointments = appointments.filter(apt => {
        const matchesSearch = !searchTerm || 
            apt.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            apt.phone?.includes(searchTerm);
        
        const aptDateStr = apt.appointment_date ? new Date(apt.appointment_date).toISOString().split('T')[0] : '';
        const matchesDate = !filterDate || aptDateStr === filterDate;
        
        return matchesSearch && matchesDate;
    });

    const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage) || 1;
    const paginatedAppointments = filteredAppointments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterDate]);

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
        setShowDetailsModal(false);
        setSelectedAppointment(null);
        setSelectedAppointmentId(null);
    };

    const handleViewDetails = (apt) => {
        setSelectedAppointmentId(apt._id);
        setShowDetailsModal(true);
    };

    // --- API HANDLERS ---
    const handleConfirmAppointment = async (appointmentId) => {
        try {
            await appointmentService.updateAppointmentStatus(appointmentId, 'SCHEDULED');
            setToast({ show: true, type: 'success', message: 'Đã xác nhận thay đổi lịch hẹn!' });
            closeModals();
            fetchPendingAppointments();
        } catch (error) {
            console.error('Error confirming appointment:', error);
            setToast({ show: true, type: 'error', message: 'Lỗi xác nhận thay đổi!' });
        }
    };

    const handleCancelAppointment = async (appointmentId, reason) => {
        try {
            await appointmentService.cancelAppointment(appointmentId);
            setToast({ show: true, type: 'success', message: 'Đã hủy thay đổi/hẹn lịch!' });
            closeModals();
            fetchPendingAppointments();
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
            fetchPendingAppointments();
        } catch (error) {
            console.error('Error rescheduling appointment:', error);
            setToast({ show: true, type: 'error', message: error?.response?.data?.message || 'Lỗi đổi lịch!' });
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-white rounded-2xl shadow-sm border border-orange-100">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                        <Clock size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 border-b border-transparent">
                            Lịch Hẹn Chờ Xác Nhận
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Xử lý các yêu cầu thay đổi lịch khám từ Bệnh nhân
                        </p>
                    </div>
                </div>
                <button
                    onClick={fetchPendingAppointments}
                    className="mt-4 md:mt-0 px-4 py-2 hover:bg-gray-50 text-gray-600 rounded-lg flex items-center gap-2 border border-gray-200 transition-colors"
                >
                    <Clock size={16} className={loading ? 'animate-spin' : ''} />
                    <span>Tải lại</span>
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Tìm theo tên bệnh nhân, số điện thoại..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none text-sm shadow-sm"
                    />
                </div>
                <div className="md:w-64">
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none text-sm text-gray-600 shadow-sm"
                    />
                </div>
            </div>

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
            {filteredAppointments.length > 0 && !loading && (
                <div className="mt-6">
                    <SharedPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredAppointments.length}
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
                onConfirm={() => handleConfirmAppointment(selectedAppointment._id)}
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

            <Toast
                show={toast.show}
                type={toast.type}
                message={toast.message}
                onClose={() => setToast({ ...toast, show: false })}
            />
        </div>
    );
};

export default ReceptionistPendingAppointments;
