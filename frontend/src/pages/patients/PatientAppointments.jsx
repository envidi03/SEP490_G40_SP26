import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import appointmentService from '../../services/appointmentService';
import PublicLayout from '../../components/layout/PublicLayout';
import Toast from '../../components/ui/Toast';
import { Calendar, ArrowLeft, Loader2 } from 'lucide-react';

// Import các components con
import AppointmentFilters from './components/AppointmentFilters';
import AppointmentCard from './components/AppointmentCard';
import AppointmentStats from './components/AppointmentStats';
import AppointmentDetailModal from './components/modals/AppointmentDetailModal';
import AppointmentUpdateModal from './components/modals/AppointmentUpdateModal';
import AppointmentCancelModal from './components/modals/AppointmentCancelModal';
import SharedPagination from '../../components/ui/SharedPagination';

/**
 * PatientAppointments - Trang quản lý lịch khám của bệnh nhân
 * 
 * Chức năng:
 * - Xem danh sách lịch khám
 * - Tìm kiếm và lọc lịch khám
 * - Xem chi tiết lịch khám
 * - Cập nhật lịch khám
 * - Hủy lịch khám
 * - Thống kê tổng quan
 * 
 * @component
 */
const PatientAppointments = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // State quản lý danh sách appointments
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // State cho search và filter (Backend side)
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // State phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const pageSize = 5;

    // State quản lý modals
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    // State cho toast notification
    const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

    // State cho form cập nhật
    const [updateForm, setUpdateForm] = useState({
        date: '',
        time: '',
        reason: ''
    });

    const fetchAppointments = async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page,
                limit: pageSize,
                search: searchTerm || undefined,
                status: statusFilter === 'all' ? undefined : statusFilter,
                sort: 'desc' // Luôn hiện lịch mới lên đầu
            };
            const res = await appointmentService.getPatientAppointments(params);

            // Theo format GetListSuccess của backend
            const data = res.data || [];
            const pagination = res.pagination || {};

            setAppointments(data);
            setTotalItems(pagination.totalItems || 0);
            setTotalPages(Math.ceil((pagination.totalItems || 0) / pageSize) || 1);
            setCurrentPage(page);
        } catch (err) {
            setError('Không thể tải danh sách lịch khám. Vui lòng thử lại!');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Effect: Load lại khi Filter/Search thay đổi (Debounce search)
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchAppointments(1);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, statusFilter]);

    // Handler khi đổi trang
    const handlePageChange = (page) => {
        fetchAppointments(page);
        // Scroll lên đầu danh sách cho dễ nhìn
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    /**
     * Hàm lấy class CSS cho status badge theo trạng thái
     */
    const getStatusColor = (status) => {
        const colors = {
            'SCHEDULED': 'bg-blue-100 text-blue-700 border-blue-200',
            'PENDING_CONFIRMATION': 'bg-orange-100 text-orange-700 border-orange-200',
            'CHECKED_IN': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'IN_CONSULTATION': 'bg-purple-100 text-purple-700 border-purple-200',
            'COMPLETED': 'bg-green-100 text-green-700 border-green-200',
            'CANCELLED': 'bg-red-100 text-red-700 border-red-200',
            'NO_SHOW': 'bg-gray-100 text-gray-700 border-gray-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    /**
     * Hàm chuyển đổi status sang tiếng Việt
     */
    const getStatusText = (status) => {
        const texts = {
            'SCHEDULED': 'Đã lên lịch',
            'PENDING_CONFIRMATION': 'Chờ xác nhận',
            'CHECKED_IN': 'Đã check-in',
            'IN_CONSULTATION': 'Đang khám',
            'COMPLETED': 'Hoàn thành',
            'CANCELLED': 'Đã hủy',
            'NO_SHOW': 'Không đến'
        };
        return texts[status] || status;
    };

    // ========== HANDLERS ==========

    /**
     * Handler: Mở modal chi tiết — gọi API lấy đầy đủ thông tin
     */
    const handleDetailClick = async (appointment) => {
        const id = appointment._id || appointment.id;
        try {
            const res = await appointmentService.getAppointmentById(id);
            setSelectedAppointment(res.data || appointment);
        } catch {
            // Nếu API lỗi, vẫn dùng data sẵn có từ list
            setSelectedAppointment(appointment);
        }
        setShowDetailModal(true);
    };

    /**
     * Handler: Mở modal cập nhật
     */
    const handleUpdateClick = (appointment) => {
        setSelectedAppointment(appointment);
        setUpdateForm({
            date: appointment.appointment_date
                ? new Date(appointment.appointment_date).toISOString().split('T')[0]
                : appointment.date || '',
            time: appointment.appointment_time || appointment.time || '',
            reason: appointment.note || appointment.reason || ''
        });
        setShowUpdateModal(true);
    };

    /**
     * Handler: Submit form cập nhật
     */
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();

        try {
            const appointmentId = selectedAppointment._id || selectedAppointment.id;

            // Gọi API cập nhật lịch khám
            await appointmentService.updateAppointment(appointmentId, {
                appointment_date: updateForm.date,
                appointment_time: updateForm.time,
                reason: updateForm.reason,
            });

            // Cập nhật lại state danh sách cho đồng bộ UI
            setAppointments(prev =>
                prev.map(apt =>
                    (apt._id || apt.id) === appointmentId
                        ? {
                            ...apt,
                            appointment_date: updateForm.date,
                            appointment_time: updateForm.time,
                            reason: updateForm.reason,
                            status: 'PENDING_CONFIRMATION' // Cập nhật trạng thái chờ xác nhận
                        }
                        : apt
                )
            );

            // Đóng modal và hiển thị thông báo
            setShowUpdateModal(false);
            setToast({
                show: true,
                type: 'success',
                message: 'Cập nhật lịch khám thành công!'
            });
            setSelectedAppointment(null);
            setUpdateForm({ date: '', time: '', reason: '' });
        } catch (error) {
            console.error('Error updating appointment:', error);
            setToast({
                show: true,
                type: 'error',
                message: error.response?.data?.message || 'Lỗi khi cập nhật lịch khám. Vui lòng thử lại!'
            });
        }
    };

    /**
     * Handler: Mở modal xác nhận hủy
     */
    const handleCancelClick = (appointment) => {
        setSelectedAppointment(appointment);
        setShowCancelModal(true);
    };

    /**
     * Handler: Xác nhận hủy lịch khám
     */
    const handleCancelConfirm = async () => {
        try {
            const appointmentId = selectedAppointment._id || selectedAppointment.id;
            // Gọi API cập nhật trạng thái
            await appointmentService.cancelAppointment(appointmentId);

            // Cập nhật lại state danh sách cho đồng bộ UI
            setAppointments(prev =>
                prev.map(apt =>
                    (apt._id || apt.id) === appointmentId
                        ? { ...apt, status: 'CANCELLED' }
                        : apt
                )
            );

            // Đóng modal và hiển thị thông báo
            setShowCancelModal(false);
            setToast({
                show: true,
                type: 'success',
                message: 'Đã hủy lịch khám thành công!'
            });
            setSelectedAppointment(null);
        } catch (error) {
            console.error('Error canceling appointment:', error);
            setToast({
                show: true,
                type: 'error',
                message: error.response?.data?.message || 'Lỗi khi hủy lịch khám. Vui lòng thử lại!'
            });
        }
    };

    // ========== RENDER ==========

    return (
        <PublicLayout>
            <div className="min-h-[calc(100vh-160px)] bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-200" />
                        <span className="font-medium">Quay lại</span>
                    </button>

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Lịch khám của tôi</h1>
                        <p className="text-gray-600">Quản lý và theo dõi các lịch khám nha khoa</p>
                    </div>

                    {/* Filters Component */}
                    {/* Loading State */}
                    {loading && (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 size={40} className="animate-spin text-primary-500" />
                            <span className="ml-3 text-gray-500 text-lg">Đang tải lịch khám...</span>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-700 mb-4">
                            <p className="font-medium">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm transition-colors"
                            >
                                Thử lại
                            </button>
                        </div>
                    )}

                    {!loading && !error && (
                        <>
                            <AppointmentFilters
                                searchTerm={searchTerm}
                                onSearchChange={setSearchTerm}
                                statusFilter={statusFilter}
                                onStatusChange={setStatusFilter}
                            />

                            {/* Stats Component */}
                            {appointments.length > 0 && (
                                <AppointmentStats appointments={appointments} />
                            )}

                            {/* Appointments List */}
                            <div className="space-y-4">
                                {appointments.length === 0 ? (
                                    // Empty State
                                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                                        <Calendar size={64} className="mx-auto text-gray-300 mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                            Không có lịch khám nào
                                        </h3>
                                        <p className="text-gray-600">
                                            {searchTerm || statusFilter !== 'all'
                                                ? 'Không tìm thấy lịch khám phù hợp với bộ lọc của bạn'
                                                : 'Bạn chưa có lịch khám nào. Đặt lịch ngay để được tư vấn!'}
                                        </p>
                                    </div>
                                ) : (
                                    // Appointment Cards
                                    <>
                                        {appointments.map((appointment) => (
                                            <AppointmentCard
                                                key={appointment.id || appointment._id}
                                                appointment={appointment}
                                                onViewDetail={handleDetailClick}
                                                onUpdate={handleUpdateClick}
                                                onCancel={handleCancelClick}
                                                getStatusColor={getStatusColor}
                                                getStatusText={getStatusText}
                                            />
                                        ))}

                                        {/* Pagination Component */}
                                        <SharedPagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            totalItems={totalItems}
                                            onPageChange={handlePageChange}
                                            itemLabel="lịch khám"
                                        />
                                    </>
                                )}
                            </div>

                        </>
                    )}
                </div>
            </div>

            {/* Toast Notification */}
            {toast.show && (
                <Toast
                    show={toast.show}
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast({ ...toast, show: false })}
                    duration={3000}
                />
            )}

            {/* Modals */}
            <AppointmentDetailModal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                appointment={selectedAppointment}
                onUpdate={handleUpdateClick}
                onCancel={handleCancelClick}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
            />

            <AppointmentUpdateModal
                isOpen={showUpdateModal}
                onClose={() => setShowUpdateModal(false)}
                onSubmit={handleUpdateSubmit}
                formData={updateForm}
                onChange={setUpdateForm}
            />

            <AppointmentCancelModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={handleCancelConfirm}
                appointment={selectedAppointment}
            />
        </PublicLayout>
    );
};

export default PatientAppointments;
