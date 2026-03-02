import { useState } from 'react';
import { FileText, Search, Eye, Edit, Clock, CheckCircle, Filter } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import ViewRecordModal from './modals/ViewRecordModal';
import UpdateRecordModal from './modals/UpdateRecordModal';

// Mock medical records data
const mockMedicalRecords = [
    {
        id: 'rec_001',
        patientName: 'Nguyễn Văn A',
        patientPhone: '0901234567',
        date: '2026-01-15',
        doctorName: 'BS. Nguyễn Văn Anh',
        diagnosis: 'Sâu răng hàm số 6',
        treatment: 'Trám răng composite',
        prescription: 'Thuốc giảm đau: Paracetamol 500mg x 2 viên/ngày x 3 ngày',
        notes: 'Bệnh nhân cần tái khám sau 1 tuần',
        status: 'completed',
        isDraft: false
    },
    {
        id: 'rec_002',
        patientName: 'Trần Thị B',
        patientPhone: '0912345678',
        date: '2026-01-16',
        doctorName: 'BS. Trần Thị Bình',
        diagnosis: 'Răng khôn mọc lệch',
        treatment: 'Nhổ răng khôn hàm dưới bên phải',
        prescription: 'Kháng sinh: Amoxicillin 500mg x 3 lần/ngày x 5 ngày\nGiảm đau: Ibuprofen 400mg khi đau',
        notes: 'Đã nhổ răng thành công, không biến chứng',
        status: 'pending_update',
        isDraft: false
    },
    {
        id: 'rec_003',
        patientName: 'Lê Văn C',
        patientPhone: '0923456789',
        date: '2026-01-17',
        doctorName: 'BS. Nguyễn Văn Anh',
        diagnosis: 'Viêm nướu',
        treatment: 'Cạo vôi răng, vệ sinh răng miệng',
        prescription: 'Nước súc miệng Listerine 2 lần/ngày',
        notes: '',
        status: 'draft',
        isDraft: true
    },
    {
        id: 'rec_004',
        patientName: 'Phạm Thị D',
        patientPhone: '0934567890',
        date: '2026-01-17',
        doctorName: 'BS. Lê Hoàng Cường',
        diagnosis: '',
        treatment: '',
        prescription: '',
        notes: '',
        status: 'draft',
        isDraft: true
    }
];

const AssistantMedicalRecords = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterDoctor, setFilterDoctor] = useState('all');

    const [selectedRecord, setSelectedRecord] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);

    const filteredRecords = mockMedicalRecords.filter(record => {
        const matchesSearch = record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.patientPhone.includes(searchTerm);
        const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
        const matchesDoctor = filterDoctor === 'all' || record.doctorName === filterDoctor;
        return matchesSearch && matchesStatus && matchesDoctor;
    });

    const getStatusInfo = (status) => {
        switch (status) {
            case 'completed':
                return { label: 'Hoàn thành', variant: 'success', icon: CheckCircle };
            case 'pending_update':
                return { label: 'Chờ cập nhật', variant: 'warning', icon: Clock };
            case 'draft':
                return { label: 'Bản nháp', variant: 'default', icon: Edit };
            default:
                return { label: status, variant: 'default', icon: FileText };
        }
    };

    const handleViewClick = (record) => {
        setSelectedRecord(record);
        setShowViewModal(true);
    };

    const handleUpdateClick = (record) => {
        setSelectedRecord(record);
        setShowUpdateModal(true);
    };

    const closeModals = () => {
        setShowViewModal(false);
        setShowUpdateModal(false);
        setSelectedRecord(null);
    };

    const handleSaveRecord = (recordId, data, isDraft) => {
        // TODO: Call API to save/update medical record
        console.log('Saving record:', recordId, data, 'isDraft:', isDraft);
    };

    // Get unique doctors for filter
    const doctors = ['all', ...new Set(mockMedicalRecords.map(r => r.doctorName).filter(d => d))];

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Hồ Sơ Bệnh Án</h1>
                <p className="text-gray-600 mt-1">Quản lý và cập nhật hồ sơ nha khoa</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Tổng hồ sơ</p>
                            <p className="text-3xl font-bold text-blue-600 mt-1">
                                {mockMedicalRecords.length}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <FileText size={24} className="text-blue-600" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Chờ cập nhật</p>
                            <p className="text-3xl font-bold text-orange-600 mt-1">
                                {mockMedicalRecords.filter(r => r.status === 'pending_update').length}
                            </p>
                        </div>
                        <div className="p-3 bg-orange-100 rounded-full">
                            <Clock size={24} className="text-orange-600" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Bản nháp</p>
                            <p className="text-3xl font-bold text-gray-600 mt-1">
                                {mockMedicalRecords.filter(r => r.isDraft).length}
                            </p>
                        </div>
                        <div className="p-3 bg-gray-100 rounded-full">
                            <Edit size={24} className="text-gray-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tìm kiếm
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Tên bệnh nhân, SĐT..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Trạng thái
                        </label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">Tất cả</option>
                            <option value="completed">Hoàn thành</option>
                            <option value="pending_update">Chờ cập nhật</option>
                            <option value="draft">Bản nháp</option>
                        </select>
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
                </div>
            </Card>

            {/* Records List */}
            <div className="grid grid-cols-1 gap-4">
                {filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => {
                        const statusInfo = getStatusInfo(record.status);
                        const StatusIcon = statusInfo.icon;

                        return (
                            <Card key={record.id} className="hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        {/* Date Badge */}
                                        <div className="bg-primary-100 px-3 py-2 rounded-lg text-center min-w-[90px]">
                                            <div className="text-xs text-primary-600 font-medium">Ngày khám</div>
                                            <div className="text-sm font-bold text-primary-700">{record.date}</div>
                                        </div>

                                        {/* Record Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">{record.patientName}</h3>
                                                <Badge variant={statusInfo.variant}>
                                                    <StatusIcon size={14} className="inline mr-1" />
                                                    {statusInfo.label}
                                                </Badge>
                                            </div>

                                            <div className="text-sm text-gray-600 space-y-1">
                                                <p><span className="font-medium">SĐT:</span> {record.patientPhone}</p>
                                                <p><span className="font-medium">Bác sĩ:</span> {record.doctorName || 'Chưa có'}</p>
                                                {record.diagnosis && (
                                                    <p><span className="font-medium">Chẩn đoán:</span> {record.diagnosis}</p>
                                                )}
                                                {record.treatment && (
                                                    <p><span className="font-medium">Điều trị:</span> {record.treatment}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 ml-4">
                                        {!record.isDraft && (
                                            <button
                                                onClick={() => handleViewClick(record)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Xem chi tiết"
                                            >
                                                <Eye size={20} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleUpdateClick(record)}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                            title={record.isDraft ? 'Chỉnh sửa nháp' : 'Cập nhật'}
                                        >
                                            <Edit size={20} />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })
                ) : (
                    <Card>
                        <div className="text-center py-12 text-gray-500">
                            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                            <p>Không tìm thấy hồ sơ nào</p>
                        </div>
                    </Card>
                )}
            </div>

            {/* Modals */}
            <ViewRecordModal
                record={selectedRecord}
                isOpen={showViewModal}
                onClose={closeModals}
            />
            <UpdateRecordModal
                record={selectedRecord}
                isOpen={showUpdateModal}
                onClose={closeModals}
                onSave={handleSaveRecord}
            />
        </div>
    );
};

export default AssistantMedicalRecords;
