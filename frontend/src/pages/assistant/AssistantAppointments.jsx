import { useState } from 'react';
import { Calendar, Clock, Search, Filter, CheckCircle, XCircle, Wrench, Eye } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import PrepareAppointmentModal from './modals/PrepareAppointmentModal';
import ViewAppointmentModal from './modals/ViewAppointmentModal';
import ReportEquipmentModal from './modals/ReportEquipmentModal';

// Mock appointments data
const mockAppointments = [
    {
        id: 'apt_001',
        time: '08:00',
        date: '2026-01-17',
        patientName: 'Nguyễn Văn A',
        patientPhone: '0901234567',
        doctorName: 'BS. Nguyễn Văn Anh',
        reason: 'Khám tổng quát',
        status: 'pending',
        preparationStatus: 'not_prepared'
    },
    {
        id: 'apt_002',
        time: '09:30',
        date: '2026-01-17',
        patientName: 'Trần Thị B',
        patientPhone: '0912345678',
        doctorName: 'BS. Trần Thị Bình',
        reason: 'Nhổ răng khôn',
        status: 'confirmed',
        preparationStatus: 'prepared'
    },
    {
        id: 'apt_003',
        time: '10:00',
        date: '2026-01-17',
        patientName: 'Lê Văn C',
        patientPhone: '0923456789',
        doctorName: 'BS. Nguyễn Văn Anh',
        reason: 'Trám răng',
        status: 'confirmed',
        preparationStatus: 'not_prepared'
    },
    {
        id: 'apt_004',
        time: '14:00',
        date: '2026-01-17',
        patientName: 'Phạm Thị D',
        patientPhone: '0934567890',
        doctorName: 'BS. Lê Hoàng Cường',
        reason: 'Tẩy trắng răng',
        status: 'confirmed',
        preparationStatus: 'in_progress'
    },
    {
        id: 'apt_005',
        time: '15:30',
        date: '2026-01-18',
        patientName: 'Hoàng Văn E',
        patientPhone: '0945678901',
        doctorName: 'BS. Nguyễn Văn Anh',
        reason: 'Niềng răng - Tư vấn',
        status: 'pending',
        preparationStatus: 'not_prepared'
    }
];

const AssistantAppointments = () => {
    const [selectedDate, setSelectedDate] = useState('2026-01-17');
    const [filterDoctor, setFilterDoctor] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showPrepareModal, setShowPrepareModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);

    const filteredAppointments = mockAppointments.filter(apt => {
        const matchesDate = apt.date === selectedDate;
        const matchesDoctor = filterDoctor === 'all' || apt.doctorName === filterDoctor;
        const matchesStatus = filterStatus === 'all' || apt.preparationStatus === filterStatus;
        const matchesSearch = apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            apt.patientPhone.includes(searchTerm);
        return matchesDate && matchesDoctor && matchesStatus && matchesSearch;
    });

    const getPreparationStatusInfo = (status) => {
        switch (status) {
            case 'prepared':
                return { label: 'Đã chuẩn bị', variant: 'success', icon: CheckCircle };
            case 'in_progress':
                return { label: 'Đang chuẩn bị', variant: 'warning', icon: Clock };
            case 'not_prepared':
                return { label: 'Chưa chuẩn bị', variant: 'danger', icon: XCircle };
            default:
                return { label: status, variant: 'default', icon: Clock };
        }
    };

    const handlePrepareClick = (appointment) => {
        setSelectedAppointment(appointment);
        setShowPrepareModal(true);
    };

    const handleViewClick = (appointment) => {
        setSelectedAppointment(appointment);
        setShowViewModal(true);
    };

    const handleReportClick = (appointment) => {
        setSelectedAppointment(appointment);
        setShowReportModal(true);
    };

    const closeModals = () => {
        setShowPrepareModal(false);
        setShowViewModal(false);
        setShowReportModal(false);
        setSelectedAppointment(null);
    };

    const handlePreparationComplete = (appointmentId, data) => {
        // TODO: Call API to update preparation status
        console.log('Preparation completed:', appointmentId, data);
    };

    const handleReportSubmit = (appointmentId, data) => {
        // TODO: Call API to submit equipment report
        console.log('Equipment report:', appointmentId, data);
    };

    // Get unique doctors for filter
    const doctors = ['all', ...new Set(mockAppointments.map(apt => apt.doctorName))];

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Quản Lý Lịch Khám</h1>
                <p className="text-gray-600 mt-1">Chuẩn bị và theo dõi lịch hẹn</p>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Date Filter */}
                    <div>
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

                    {/* Doctor Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bác sĩ
                        </label>
                        <select
                            value={filterDoctor}
                            onChange={(e) => setFilterDoctor(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">Tất cả</option>
                            {doctors.filter(d => d !== 'all').map(doctor => (
                                <option key={doctor} value={doctor}>{doctor}</option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Trạng thái chuẩn bị
                        </label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">Tất cả</option>
                            <option value="not_prepared">Chưa chuẩn bị</option>
                            <option value="in_progress">Đang chuẩn bị</option>
                            <option value="prepared">Đã chuẩn bị</option>
                        </select>
                    </div>

                    {/* Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tìm kiếm
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Tên, SĐT..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Appointments List */}
            <div className="grid grid-cols-1 gap-4">
                {filteredAppointments.length > 0 ? (
                    filteredAppointments.map((apt) => {
                        const prepStatusInfo = getPreparationStatusInfo(apt.preparationStatus);
                        const PrepStatusIcon = prepStatusInfo.icon;

                        return (
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
                                                <Clock size={14} />
                                                {apt.patientPhone}
                                            </div>
                                            <p className="text-sm text-gray-700 mt-2">
                                                <span className="font-medium">Lý do:</span> {apt.reason}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                <span className="font-medium">Bác sĩ:</span> {apt.doctorName}
                                            </p>
                                        </div>

                                        {/* Preparation Status Badge */}
                                        <div>
                                            <Badge variant={prepStatusInfo.variant}>
                                                <PrepStatusIcon size={14} className="inline mr-1" />
                                                {prepStatusInfo.label}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={() => handleViewClick(apt)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Xem chi tiết"
                                        >
                                            <Eye size={20} />
                                        </button>
                                        <button
                                            onClick={() => handlePrepareClick(apt)}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                            title="Chuẩn bị"
                                        >
                                            <CheckCircle size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleReportClick(apt)}
                                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                            title="Báo cáo sự cố"
                                        >
                                            <Wrench size={20} />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })
                ) : (
                    <Card>
                        <div className="text-center py-12 text-gray-500">
                            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                            <p>Không có lịch hẹn nào</p>
                        </div>
                    </Card>
                )}
            </div>

            {/* Modals */}
            <ViewAppointmentModal
                appointment={selectedAppointment}
                isOpen={showViewModal}
                onClose={closeModals}
            />
            <PrepareAppointmentModal
                appointment={selectedAppointment}
                isOpen={showPrepareModal}
                onClose={closeModals}
                onComplete={handlePreparationComplete}
            />
            <ReportEquipmentModal
                appointment={selectedAppointment}
                isOpen={showReportModal}
                onClose={closeModals}
                onSubmit={handleReportSubmit}
            />
        </div>
    );
};

export default AssistantAppointments;
