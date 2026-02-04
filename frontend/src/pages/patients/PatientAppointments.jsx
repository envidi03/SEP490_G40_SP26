import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { mockAppointments } from '../../utils/mockData';
import PublicLayout from '../../components/layout/PublicLayout';
import Toast from '../../components/ui/Toast';
import { Calendar, ArrowLeft } from 'lucide-react';

// Import các components con
import AppointmentFilters from './components/AppointmentFilters';
import AppointmentCard from './components/AppointmentCard';
import AppointmentStats from './components/AppointmentStats';
import AppointmentDetailModal from './components/modals/AppointmentDetailModal';
import AppointmentUpdateModal from './components/modals/AppointmentUpdateModal';
import AppointmentCancelModal from './components/modals/AppointmentCancelModal';

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

    // State cho search và filter
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

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

    // Effect: Load appointments khi component mount
    useEffect(() => {
        if (user) {
            // Trong thực tế sẽ filter theo user.id
            // Hiện tại dùng mock data để demo
            const userAppointments = mockAppointments;
            setAppointments(userAppointments);
            setFilteredAppointments(userAppointments);
        }
    }, [user]);

    // Effect: Lọc appointments khi search/filter thay đổi
    useEffect(() => {
        let filtered = appointments;

        // Lọc theo trạng thái
        if (statusFilter !== 'all') {
            filtered = filtered.filter(apt => apt.status === statusFilter);
        }

        // Lọc theo search term
        if (searchTerm) {
            filtered = filtered.filter(apt =>
                apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                apt.reason.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredAppointments(filtered);
    }, [searchTerm, statusFilter, appointments]);

    /**
     * Hàm lấy class CSS cho status badge theo trạng thái
     */
    const getStatusColor = (status) => {
        const colors = {
            'Confirmed': 'bg-green-100 text-green-700 border-green-200',
            'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'Completed': 'bg-blue-100 text-blue-700 border-blue-200',
            'Cancelled': 'bg-red-100 text-red-700 border-red-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    /**
     * Hàm chuyển đổi status sang tiếng Việt
     */
    const getStatusText = (status) => {
        const texts = {
            'Confirmed': 'Đã xác nhận',
            'Pending': 'Chờ xác nhận',
            'Completed': 'Hoàn thành',
            'Cancelled': 'Đã hủy'
        };
        return texts[status] || status;
    };

    // ========== HANDLERS ==========

    /**
     * Handler: Mở modal chi tiết
     */
    const handleDetailClick = (appointment) => {
        setSelectedAppointment(appointment);
        setShowDetailModal(true);
    };

    /**
     * Handler: Mở modal cập nhật
     */
    const handleUpdateClick = (appointment) => {
        setSelectedAppointment(appointment);
        setUpdateForm({
            date: appointment.date,
            time: appointment.time,
            reason: appointment.reason
        });
        setShowUpdateModal(true);
    };

    /**
     * Handler: Submit form cập nhật
     */
    const handleUpdateSubmit = (e) => {
        e.preventDefault();

        // Cập nhật appointment trong state
        setAppointments(prev =>
            prev.map(apt =>
                apt.id === selectedAppointment.id
                    ? { ...apt, ...updateForm }
                    : apt
            )
        );

        // Đóng modal và hiển thị thông báo
        setShowUpdateModal(false);
        setToast({
            show: true,
            type: 'success',
            message: '✅ Cập nhật lịch khám thành công!'
        });
        setSelectedAppointment(null);
        setUpdateForm({ date: '', time: '', reason: '' });
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
    const handleCancelConfirm = () => {
        // Cập nhật status thành Cancelled
        setAppointments(prev =>
            prev.map(apt =>
                apt.id === selectedAppointment.id
                    ? { ...apt, status: 'Cancelled' }
                    : apt
            )
        );

        // Đóng modal và hiển thị thông báo
        setShowCancelModal(false);
        setToast({
            show: true,
            type: 'success',
            message: '✅ Đã hủy lịch khám thành công!'
        });
        setSelectedAppointment(null);
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
                    <AppointmentFilters
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        statusFilter={statusFilter}
                        onStatusChange={setStatusFilter}
                    />

                    {/* Appointments List */}
                    <div className="space-y-4">
                        {filteredAppointments.length === 0 ? (
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
                            filteredAppointments.map((appointment) => (
                                <AppointmentCard
                                    key={appointment.id}
                                    appointment={appointment}
                                    onViewDetail={handleDetailClick}
                                    onUpdate={handleUpdateClick}
                                    onCancel={handleCancelClick}
                                    getStatusColor={getStatusColor}
                                    getStatusText={getStatusText}
                                />
                            ))
                        )}
                    </div>

                    {/* Stats Component */}
                    {filteredAppointments.length > 0 && (
                        <AppointmentStats appointments={appointments} />
                    )}
                </div>
            </div>

            {/* Toast Notification */}
            {toast.show && (
                <Toast
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
