import React, { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import Card from '../../components/ui/Card';
import { mockAppointments } from '../../utils/mockData';
import { useAuth } from '../../contexts/AuthContext';
import MedicalRecordTable from './components/MedicalRecordTable';
import AppointmentDetailModal from '../appointments/components/AppointmentDetailModal';
import CreateRecordModal from './components/CreateRecordModal';

const MedicalRecordList = () => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Create Record Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedAppointmentForCreate, setSelectedAppointmentForCreate] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filter completed appointments for the logged-in doctor
    const completedAppointments = useMemo(() => {
        return mockAppointments.filter(apt =>
            apt.doctor_id === user?.id &&
            (apt.status === 'Completed' || apt.status === 'Confirmed')
        );
    }, [user]);

    const filteredAppointments = useMemo(() => {
        return completedAppointments.filter(apt =>
            apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            apt.code.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [completedAppointments, searchTerm]);

    const handleViewDetail = (appointment) => {
        setSelectedAppointment(appointment);
        setIsDetailModalOpen(true);
    };

    const handleCreateRecord = (appointment) => {
        setSelectedAppointmentForCreate(appointment);
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
        setSelectedAppointmentForCreate(null);
    };

    const handleSubmitRecord = async (formData) => {
        setIsSubmitting(true);
        try {
            // Simulate API call
            console.log('Creating record for appointment:', selectedAppointmentForCreate.id);
            console.log('Data:', {
                ...formData,
                patient_id: selectedAppointmentForCreate.patient_id,
                doctor_id: user.id,
                appointment_id: selectedAppointmentForCreate.id
            });

            // Simulate delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            alert('Tạo hồ sơ thành công!');
            handleCloseCreateModal();
        } catch (error) {
            console.error('Error creating record:', error);
            alert('Có lỗi xảy ra');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Quản lý Hồ sơ Bệnh án</h1>
                <p className="text-gray-600 mt-1">Danh sách bệnh nhân đã khám và cần tạo hồ sơ</p>
            </div>

            {/* Search and Filter */}
            <Card>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên bệnh nhân, mã lịch hẹn..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-center gap-2 md:w-48">
                        <Filter size={20} className="text-gray-400" />
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            defaultValue="all"
                        >
                            <option value="all">Tất cả thời gian</option>
                            <option value="today">Hôm nay</option>
                            <option value="week">Tuần này</option>
                            <option value="month">Tháng này</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Table */}
            <Card title={`Danh sách chờ tạo hồ sơ (${filteredAppointments.length})`}>
                <MedicalRecordTable
                    appointments={filteredAppointments}
                    onViewDetail={handleViewDetail}
                    onCreateRecord={handleCreateRecord}
                />
            </Card>

            {/* Detail Modal (View Only) */}
            <AppointmentDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                appointment={selectedAppointment}
            />

            {/* Create Record Modal (Side-by-Side) */}
            <CreateRecordModal
                isOpen={isCreateModalOpen}
                onClose={handleCloseCreateModal}
                appointment={selectedAppointmentForCreate}
                onSubmit={handleSubmitRecord}
                isSubmitting={isSubmitting}
            />
        </div>
    );
};

export default MedicalRecordList;
