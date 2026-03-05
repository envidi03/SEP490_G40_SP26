import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getDentalRecordsByDoctor, getDentalRecordsByPatientInfo, mockDentalRecords } from '../../utils/mockData';
import { Search, FilePlus, Eye, ChevronRight, User, Calendar, Phone, Activity } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import CreateDentalRecordModal from './components/CreateDentalRecordModal';

const statusConfig = {
    IN_PROGRESS: { label: 'Đang điều trị', variant: 'warning' },
    COMPLETED: { label: 'Hoàn thành', variant: 'success' },
    CANCELLED: { label: 'Đã hủy', variant: 'danger' },
};

// Simple in-memory store so that newly created records persist within session
let localDentalRecords = [...mockDentalRecords];

const DentalRecordList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const queryName = searchParams.get('name') || '';
    const queryDob = searchParams.get('dob') || '';
    const queryGender = searchParams.get('gender') || '';
    const appointmentId = searchParams.get('appointmentId') || '';

    const [searchTerm, setSearchTerm] = useState(queryName);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Context: if we came from appointment, show patient-specific results
    const isPatientContext = Boolean(queryName);

    const allDoctorRecords = getDentalRecordsByDoctor(user?.id || '696e3df17ea4d06340b4b5e1');

    const records = useMemo(() => {
        if (isPatientContext && queryName) {
            // Show records matching patient info (may have duplicates with same name, diff DOB/gender)
            return localDentalRecords.filter(r => {
                const doctorMatch = r.doctor_id === (user?.id || '696e3df17ea4d06340b4b5e1');
                const nameMatch = r.patient_name.toLowerCase().includes(queryName.toLowerCase());
                return doctorMatch && nameMatch;
            });
        }
        // General search
        return localDentalRecords
            .filter(r => r.doctor_id === (user?.id || '696e3df17ea4d06340b4b5e1'))
            .filter(r =>
                r.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.record_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [searchTerm, queryName, isPatientContext, user]);

    const handleCreateRecord = (formData) => {
        const newRecord = {
            id: `dr_${Date.now()}`,
            doctor_id: user?.id || '696e3df17ea4d06340b4b5e1',
            appointment_id: appointmentId || null,
            patient_name: queryName || formData.patient_name,
            patient_dob: queryDob || formData.patient_dob,
            patient_gender: queryGender || formData.patient_gender,
            patient_phone: searchParams.get('phone') || formData.patient_phone,
            record_name: formData.record_name,
            diagnosis: formData.diagnosis,
            tooth_number: formData.tooth_number,
            start_date: formData.start_date,
            end_date: formData.end_date,
            total_amount: formData.total_amount,
            status: formData.status || 'IN_PROGRESS',
            created_at: new Date().toISOString(),
        };
        localDentalRecords = [newRecord, ...localDentalRecords];
        setIsCreateModalOpen(false);
        navigate(`/dentist/dental-records/${newRecord.id}`);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Link to="/dentist/schedule" className="hover:text-blue-600">Lịch hẹn</Link>
                        <ChevronRight size={14} />
                        <span className="text-gray-900 font-medium">Hồ Sơ Nha Khoa</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isPatientContext ? `Hồ Sơ: ${queryName}` : 'Hồ Sơ Nha Khoa'}
                    </h1>
                    {isPatientContext && (
                        <p className="text-gray-500 mt-1 text-sm">
                            {queryDob && <span className="mr-3">📅 {queryDob}</span>}
                            {queryGender && <span>⚧ {queryGender}</span>}
                        </p>
                    )}
                </div>
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 self-start md:self-auto"
                >
                    <FilePlus size={18} />
                    Tạo Hồ Sơ Mới
                </Button>
            </div>

            {/* Search bar (only in non-patient context) */}
            {!isPatientContext && (
                <Card>
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên bệnh nhân, tên hồ sơ, chẩn đoán..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </Card>
            )}

            {/* Patient context notice */}
            {isPatientContext && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                    <strong>Lưu ý:</strong> Hiển thị tất cả hồ sơ của bệnh nhân tên "<strong>{queryName}</strong>".
                    Nếu có nhiều hồ sơ trùng tên, vui lòng kiểm tra ngày sinh và giới tính để xác định đúng bệnh nhân.
                </div>
            )}

            {/* Records count */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-700">
                    Tìm thấy <span className="text-blue-600">{records.length}</span> hồ sơ
                </h2>
            </div>

            {/* Record Cards */}
            {records.length === 0 ? (
                <Card>
                    <div className="py-16 text-center text-gray-500">
                        <Activity size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">Chưa có hồ sơ nha khoa</p>
                        <p className="text-sm mt-1">Bấm "Tạo Hồ Sơ Mới" để thêm hồ sơ đầu tiên</p>
                    </div>
                </Card>
            ) : (
                <div className="space-y-4">
                    {records.map(record => {
                        const statusInfo = statusConfig[record.status] || { label: record.status, variant: 'default' };
                        return (
                            <div
                                key={record.id}
                                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="p-5">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        {/* Left: patient & record info */}
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-semibold text-gray-900 text-base">{record.record_name}</h3>
                                                <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                                            </div>

                                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                <span className="flex items-center gap-1">
                                                    <User size={14} className="text-gray-400" />
                                                    <strong>{record.patient_name}</strong>
                                                </span>
                                                {record.patient_dob && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={14} className="text-gray-400" />
                                                        {record.patient_dob}
                                                    </span>
                                                )}
                                                <span className="text-gray-400">⚧ {record.patient_gender}</span>
                                                {record.patient_phone && (
                                                    <span className="flex items-center gap-1">
                                                        <Phone size={14} className="text-gray-400" />
                                                        {record.patient_phone}
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                                                <strong>Chẩn đoán:</strong> {record.diagnosis}
                                            </p>

                                            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                                                <span>📅 Bắt đầu: {record.start_date}</span>
                                                {record.end_date && <span>📅 Kết thúc: {record.end_date}</span>}
                                                {record.tooth_number && <span>🦷 Răng: {record.tooth_number}</span>}
                                                {record.total_amount > 0 && (
                                                    <span>💰 {record.total_amount.toLocaleString('vi-VN')}đ</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right: action */}
                                        <div className="flex items-center">
                                            <Button
                                                onClick={() => navigate(`/dentist/dental-records/${record.id}`)}
                                                className="flex items-center gap-2"
                                            >
                                                <Eye size={16} />
                                                Xem chi tiết
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Dental Record Modal */}
            <CreateDentalRecordModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateRecord}
                defaultName={queryName}
                defaultDob={queryDob}
                defaultGender={queryGender}
                defaultPhone={searchParams.get('phone') || ''}
            />
        </div>
    );
};

export default DentalRecordList;
