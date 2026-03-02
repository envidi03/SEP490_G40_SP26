import React, { useState } from 'react';
import { Search, UserPlus, Phone, Mail, Calendar, Edit, Eye } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { mockPatients } from '../../utils/mockData';
import ViewPatientModal from './components/modals/ViewPatientModal';
import EditPatientModal from './components/modals/EditPatientModal';
import ScheduleAppointmentModal from './components/modals/ScheduleAppointmentModal';

const ReceptionistPatients = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);

    const filteredPatients = mockPatients.filter(patient => {
        const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.phone.includes(searchTerm) ||
            patient.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'all' || patient.status.toLowerCase() === filterStatus;

        return matchesSearch && matchesStatus;
    });

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

    const closeModal = () => {
        setShowViewModal(false);
        setShowEditModal(false);
        setShowScheduleModal(false);
        setSelectedPatient(null);
    };

    const handleSavePatient = (updatedData) => {
        // TODO: Call API to update patient
        console.log('Updating patient:', updatedData);
    };

    const handleScheduleSubmit = (appointmentData) => {
        // TODO: Call API to create appointment
        console.log('Creating appointment:', appointmentData);
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
                    <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2">
                        <UserPlus size={20} />
                        Thêm Bệnh Nhân
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
                            {filteredPatients.length > 0 ? (
                                filteredPatients.map((patient) => (
                                    <tr key={patient.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                                        <span className="text-primary-600 font-medium">
                                                            {patient.name.charAt(0)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {patient.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        ID: {patient.id.slice(-8)}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center text-sm text-gray-900">
                                                    <Phone size={14} className="mr-2 text-gray-400" />
                                                    {patient.phone}
                                                </div>
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <Mail size={14} className="mr-2 text-gray-400" />
                                                    {patient.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-900">
                                                <Calendar size={14} className="mr-2 text-gray-400" />
                                                {patient.dob}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant={patient.status === 'ACTIVE' ? 'success' : 'danger'}>
                                                {patient.status === 'ACTIVE' ? 'Hoạt động' : 'Ngưng'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
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
                                ))
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
                {filteredPatients.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Hiển thị <span className="font-medium">{filteredPatients.length}</span> bệnh nhân
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
                    patientId={selectedPatient.id}
                    patientName={selectedPatient.name}
                    patientPhone={selectedPatient.phone}
                    patientEmail={selectedPatient.email}
                    patientDob={selectedPatient.dob}
                    patientGender={selectedPatient.gender}
                    patientAddress={selectedPatient.address}
                    patientStatus={selectedPatient.status}
                    isOpen={showViewModal}
                    onClose={closeModal}
                />
            )}

            {/* Edit Patient Modal */}
            <EditPatientModal
                patient={selectedPatient}
                isOpen={showEditModal}
                onClose={closeModal}
                onSave={handleSavePatient}
            />

            {/* Schedule Appointment Modal */}
            <ScheduleAppointmentModal
                patient={selectedPatient}
                isOpen={showScheduleModal}
                onClose={closeModal}
                onSchedule={handleScheduleSubmit}
            />
        </div>
    );
};

export default ReceptionistPatients;
