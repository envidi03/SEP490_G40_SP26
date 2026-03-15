import { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, Search, Plus, CheckCircle, XCircle, Phone, Loader2, RefreshCw, Eye } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Toast from '../../components/ui/Toast';
import appointmentService from '../../services/appointmentService';

import ConfirmAppointmentModal from './components/modals/ConfirmAppointmentModal';
import CancelAppointmentModal from './components/modals/CancelAppointmentModal';
import RescheduleAppointmentModal from './components/modals/RescheduleAppointmentModal';
import ContactPatientModal from './components/modals/ContactPatientModal';
import BookAppointmentModal from './components/modals/BookAppointmentModal';
import ViewAppointmentDetailsModal from './components/modals/ViewAppointmentDetailsModal';

const ReceptionistAppointments = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(todayStr); // Default to today
    const [filterStatus, setFilterStatus] = useState('all');

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, type: '', message: '' });

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
            // Lấy danh sách (trang 1, limit lớn xíu để lấy nhiều cho front-end filter date)
            const response = await appointmentService.getStaffAppointments({
                page: 1,
                limit: 1000 // Tạm thời dùng limit lớn để lọc frontend cho tiện
            });
            const data = response?.data?.data || response?.data || [];
            setAppointments(Array.isArray(data) ? data : data.data || []);
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

    // --- HELPERS ---
    const getStatusVariant = (status) => {
        switch (status) {
            case 'COMPLETED': return 'primary';
            case 'CHECKED_IN': return 'success';
            case 'IN_CONSULTATION': return 'success';
            case 'SCHEDULED': return 'warning';
            case 'CANCELLED': return 'danger';
            case 'NO_SHOW': return 'danger';
            default: return 'default';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'SCHEDULED': return 'Chờ khám';
            case 'CHECKED_IN': return 'Đã đến';
            case 'IN_CONSULTATION': return 'Đang khám';
            case 'COMPLETED': return 'Hoàn thành';
            case 'CANCELLED': return 'Đã hủy';
            case 'NO_SHOW': return 'Không đến';
            default: return status;
        }
    };

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
            setToast({ show: true, type: 'success', message: '✅ Đặt lịch thành công!' });
            closeModals();
            fetchAppointments();
        } catch (error) {
            console.error('Error creating appointment:', error);
            setToast({ show: true, type: 'error', message: error?.response?.data?.message || '❌ Lỗi khi đặt lịch!' });
        }
    };

    const handleConfirmAppointment = async (appointmentId) => {
        try {
            // Xác nhận (Check-in)
            await appointmentService.updateAppointmentStatus(appointmentId, 'CHECKED_IN');
            setToast({ show: true, type: 'success', message: '✅ Đã xác nhận bệnh nhân đến!' });
            closeModals();
            fetchAppointments();
        } catch (error) {
            console.error('Error confirming appointment:', error);
            setToast({ show: true, type: 'error', message: '❌ Lỗi xác nhận!' });
        }
    };

    const handleCancelAppointment = async (appointmentId, reason) => {
        try {
            await appointmentService.cancelAppointment(appointmentId);
            setToast({ show: true, type: 'success', message: '✅ Đã hủy lịch hẹn!' });
            closeModals();
            fetchAppointments();
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            setToast({ show: true, type: 'error', message: '❌ Lỗi hủy lịch!' });
        }
    };

    const handleRescheduleAppointment = async (appointmentId, data) => {
        try {
            await appointmentService.updateAppointment(appointmentId, data);
            setToast({ show: true, type: 'success', message: '✅ Đã đổi lịch thành công!' });
            closeModals();
            fetchAppointments();
        } catch (error) {
            console.error('Error rescheduling appointment:', error);
            setToast({ show: true, type: 'error', message: error?.response?.data?.message || '❌ Lỗi đổi lịch!' });
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Quản Lý Lịch Hẹn</h1>
                    <p className="text-gray-600 mt-1">Đặt lịch và theo dõi cuộc hẹn</p>
                </div>
                <button
                    onClick={fetchAppointments}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Tải lại
                </button>
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
                            <option value="SCHEDULED">Chờ khám</option>
                            <option value="CHECKED_IN">Đã đến</option>
                            <option value="IN_CONSULTATION">Đang khám</option>
                            <option value="COMPLETED">Hoàn thành</option>
                            <option value="CANCELLED">Đã hủy</option>
                        </select>
                    </div>

                    {/* Add Button */}
                    <div className="flex items-end">
                        <button
                            onClick={() => setShowBookModal(true)}
                            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                        >
                            <Plus size={20} />
                            Đặt lịch mới
                        </button>
                    </div>
                </div>
            </Card>

            {/* Appointments Grid */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <Card>
                        <div className="text-center py-16">
                            <Loader2 size={40} className="mx-auto text-primary-500 animate-spin mb-4" />
                            <p className="text-gray-500">Đang tải lịch hẹn...</p>
                        </div>
                    </Card>
                ) : filteredAppointments.length > 0 ? (
                    filteredAppointments.map((apt) => (
                        <Card key={apt._id} className="hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                    {/* Time */}
                                    <div className="bg-primary-100 p-4 rounded-lg text-center min-w-[80px]">
                                        <div className="text-xs text-primary-600 font-medium">Giờ</div>
                                        <div className="text-lg font-bold text-primary-700">{apt.appointment_time}</div>
                                    </div>

                                    {/* Patient Info */}
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900">{apt.full_name}</h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                            <Phone size={14} />
                                            {apt.phone}
                                        </div>
                                        <p className="text-sm text-gray-700 mt-2">
                                            <span className="font-medium">Lý do:</span> {apt.reason || 'Không rõ'}
                                        </p>
                                    </div>

                                    {/* Status Badge */}
                                    <div>
                                        <Badge variant={getStatusVariant(apt.status)}>
                                            {getStatusLabel(apt.status)}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 ml-4">
                                    {apt.status === 'SCHEDULED' && (
                                        <>
                                            <button
                                                onClick={() => handleConfirmClick(apt)}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                title="Xác nhận đến"
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
                                    <button
                                        onClick={() => handleViewDetails(apt)}
                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        title="Xem chi tiết"
                                    >
                                        <Eye size={20} />
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

            {/* View Details Modal */}
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

            {/* Book Appointment Modal */}
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
