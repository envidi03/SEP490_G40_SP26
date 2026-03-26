import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Phone, Mail, Calendar, Edit, Eye, CheckCircle, FileText, Loader2, RefreshCw } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Toast from '../../components/ui/Toast';
import ViewPatientModal from './components/modals/ViewPatientModal';
import EditPatientModal from './components/modals/EditPatientModal';
import ScheduleAppointmentModal from './components/modals/ScheduleAppointmentModal';
import AddPatientModal from './components/modals/AddPatientModal';
import CreateInvoiceModal from './components/modals/CreateInvoiceModal';

import patientService from '../../services/patientService';
import appointmentService from '../../services/appointmentService';
import { formatDate } from '../../utils/dateUtils';

const ReceptionistPatients = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const params = {};
            if (searchTerm) params.search = searchTerm;
            if (filterStatus !== 'all') params.status = filterStatus;

            const response = await patientService.getAllPatients(params);
            const data = response.data?.data || response.data || [];
            setPatients(Array.isArray(data) ? data : data.data || []);
        } catch (error) {
            console.error('Error fetching patients:', error);
            setToast({ show: true, message: 'Lỗi khi tải danh sách bệnh nhân', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchPatients();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, filterStatus]);

    const handleViewPatient = (patient) => {
        setSelectedPatient(patient);
        setShowViewModal(true);
    };

    const handleEditPatient = (patient) => {
        setSelectedPatient(patient);
        setShowEditModal(true);
    };

    const handleScheduleAppointment = (patient) => {
        setSelectedPatient(patient);
        setShowScheduleModal(true);
    };

    const handleIssueInvoice = (patient) => {
        setSelectedPatient(patient);
        setShowInvoiceModal(true);
    };

    const handleCheckIn = async (patient) => {
        try {
            const today = new Date().toISOString().split('T')[0];
            // Fetch today's appointments for this patient
            const id = patient._id || patient.id;
            const aptResponse = await appointmentService.getStaffAppointments({
                page: 1,
                limit: 100
            });
            const allApts = aptResponse.data?.data || aptResponse.data || [];
            const aptList = Array.isArray(allApts) ? allApts : allApts.data || [];

            const todayApt = aptList.find(apt => {
                const aptDate = new Date(apt.appointment_date).toISOString().split('T')[0];
                const aptPatientId = apt.patient_id?._id || apt.patient_id;
                return aptDate === today && aptPatientId === id && apt.status === 'SCHEDULED';
            });

            if (todayApt) {
                await appointmentService.updateAppointmentStatus(todayApt._id, 'CHECKED_IN');
                setToast({ show: true, message: 'Check-in thành công cho bệnh nhân!', type: 'success' });
            } else {
                setToast({
                    show: true,
                    message: 'Không tìm thấy lịch hẹn SCHEDULED của bệnh nhân trong hôm nay.',
                    type: 'error'
                });
            }
        } catch (error) {
            console.error('Error during check-in:', error);
            setToast({ show: true, message: 'Lỗi trong quá trình check-in.', type: 'error' });
        }
    };

    const closeModal = () => {
        setShowViewModal(false);
        setShowEditModal(false);
        setShowScheduleModal(false);
        setShowAddModal(false);
        setShowInvoiceModal(false);
        setSelectedPatient(null);
    };

    const handleAddPatientSuccess = (newPatient) => {
        fetchPatients();
        // Toast is handled inside modal for better UX
    };

    const handleSavePatientSuccess = (updatedPatient) => {
        fetchPatients();
    };

    const handleScheduleSubmit = (appointmentData) => {
        // This is handled in ScheduleAppointmentModal
        fetchPatients();
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Quản Lý Bệnh Nhân</h1>
                <p className="text-gray-600 mt-1">Danh sách và thông tin bệnh nhân</p>
            </div>

            {/* Filters & Search */}
            <Card className="mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, SĐT, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>

                    {/* Filter by Status */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="active">Đang hoạt động</option>
                        <option value="inactive">Ngưng hoạt động</option>
                    </select>

                    {/* Add Patient Button */}
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                    >
                        <UserPlus size={20} />
                        Thêm Bệnh Nhân
                    </button>
                    <button
                        onClick={fetchPatients}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
                        title="Tải lại"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </Card>

            {/* Patients List */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Bệnh nhân
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Liên hệ
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ngày sinh
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 size={30} className="animate-spin text-primary-500" />
                                            <span>Đang tải danh sách bệnh nhân...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : patients.length > 0 ? (
                                patients.map((patient) => {
                                    const profile = patient.profile || {};
                                    const pName = profile.full_name || patient.name || 'N/A';
                                    const pPhone = profile.phone || patient.phone || 'N/A';
                                    const pEmail = profile.email || patient.email || 'N/A';
                                    const pDob = formatDate(profile.dob || patient.dob);
                                    const isActive = patient.status?.toUpperCase() === 'ACTIVE';

                                    return (
                                        <tr key={patient._id || patient.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {pName}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center text-sm text-gray-900">
                                                        <Phone size={14} className="mr-2 text-gray-400" />
                                                        {pPhone}
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <Mail size={14} className="mr-2 text-gray-400" />
                                                        {pEmail}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-gray-900">
                                                    <Calendar size={14} className="mr-2 text-gray-400" />
                                                    {pDob}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge variant={isActive ? 'success' : 'danger'}>
                                                    {isActive ? 'Hoạt động' : 'Ngưng'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleIssueInvoice(patient)}
                                                        className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition-colors"
                                                        title="Xuất hóa đơn"
                                                    >
                                                        <FileText size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleViewPatient(patient)}
                                                        className="text-primary-600 hover:text-primary-900 p-2 hover:bg-primary-50 rounded transition-colors"
                                                        title="Xem chi tiết"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditPatient(patient)}
                                                        className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded transition-colors"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleScheduleAppointment(patient)}
                                                        className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded transition-colors"
                                                        title="Đặt lịch hẹn"
                                                    >
                                                        <Calendar size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        Không tìm thấy bệnh nhân nào
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {patients.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Hiển thị <span className="font-medium">{patients.length}</span> bệnh nhân
                        </div>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">
                                Trước
                            </button>
                            <button className="px-3 py-1 bg-primary-600 text-white rounded text-sm">
                                1
                            </button>
                            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-sm">
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </Card>

            {/* View Patient Modal */}
            {selectedPatient && (
                <ViewPatientModal
                    patientId={selectedPatient._id || selectedPatient.id}
                    patientName={selectedPatient.profile?.full_name || selectedPatient.name}
                    patientPhone={selectedPatient.profile?.phone || selectedPatient.phone}
                    patientEmail={selectedPatient.profile?.email || selectedPatient.email}
                    patientDob={formatDate(selectedPatient.profile?.dob || selectedPatient.dob)}
                    patientGender={selectedPatient.profile?.gender || selectedPatient.gender}
                    patientAddress={selectedPatient.profile?.address || selectedPatient.address}
                    patientStatus={selectedPatient.status?.toUpperCase()}
                    isOpen={showViewModal}
                    onClose={closeModal}
                />
            )}

            {/* Edit Patient Modal */}
            <EditPatientModal
                patient={selectedPatient}
                isOpen={showEditModal}
                onClose={closeModal}
                onSave={handleSavePatientSuccess}
            />

            {/* Schedule Appointment Modal */}
            <ScheduleAppointmentModal
                patient={selectedPatient}
                isOpen={showScheduleModal}
                onClose={closeModal}
                onSchedule={handleScheduleSubmit}
            />

            <AddPatientModal
                isOpen={showAddModal}
                onClose={closeModal}
                onSave={handleAddPatientSuccess}
            />

            {/* Create Invoice Modal */}
            <CreateInvoiceModal
                isOpen={showInvoiceModal}
                onClose={closeModal}
                initialPatient={selectedPatient}
                onSuccess={() => {
                    setToast({ show: true, message: 'Tạo hóa đơn thành công!', type: 'success' });
                    fetchPatients();
                }}
            />

            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ ...toast, show: false })}
            />
        </div>
    );
};

export default ReceptionistPatients;
