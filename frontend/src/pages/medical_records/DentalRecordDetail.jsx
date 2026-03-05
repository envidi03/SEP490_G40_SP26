import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { mockDentalRecords, getTreatmentsByRecord, mockTreatments } from '../../utils/mockData';
import { ChevronRight, User, Calendar, Phone, Activity, CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const statusConfig = {
    IN_PROGRESS: { label: 'Đang điều trị', variant: 'warning' },
    COMPLETED: { label: 'Hoàn thành', variant: 'success' },
    CANCELLED: { label: 'Đã hủy', variant: 'danger' },
};

const treatmentStatusConfig = {
    PENDING: { label: 'Chờ phê duyệt', variant: 'warning', icon: Clock },
    APPROVED: { label: 'Đã duyệt', variant: 'success', icon: CheckCircle },
    REJECTED: { label: 'Từ chối', variant: 'danger', icon: XCircle },
};

// In-memory state for treatments
let localTreatments = [...mockTreatments];

const DentalRecordDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [treatments, setTreatments] = useState(() => localTreatments.filter(t => t.dental_record_id === id));

    const record = mockDentalRecords.find(r => r.id === id);

    if (!record) {
        return (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
                <Activity size={56} className="text-gray-300" />
                <p className="text-xl font-semibold text-gray-500">Không tìm thấy hồ sơ</p>
                <Button onClick={() => navigate(-1)} variant="outline">← Quay lại</Button>
            </div>
        );
    }

    const recordStatus = statusConfig[record.status] || { label: record.status, variant: 'default' };

    const handleApproveTreatment = (treatmentId) => {
        setTreatments(prev =>
            prev.map(t =>
                t.id === treatmentId
                    ? { ...t, status: 'APPROVED', approved_by: user?.id, approved_at: new Date().toISOString() }
                    : t
            )
        );
        // Update local store
        localTreatments = localTreatments.map(t =>
            t.id === treatmentId ? { ...t, status: 'APPROVED' } : t
        );
    };

    const handleRejectTreatment = (treatmentId) => {
        const reason = prompt('Nhập lý do từ chối:');
        if (reason === null) return;
        setTreatments(prev =>
            prev.map(t =>
                t.id === treatmentId
                    ? { ...t, status: 'REJECTED', note: (t.note ? t.note + ' | ' : '') + 'Từ chối: ' + reason }
                    : t
            )
        );
        localTreatments = localTreatments.map(t =>
            t.id === treatmentId ? { ...t, status: 'REJECTED' } : t
        );
    };

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <Link to="/dentist/dental-records" className="hover:text-blue-600">Hồ Sơ Nha Khoa</Link>
                <ChevronRight size={14} />
                <span className="text-gray-900 font-medium">{record.record_name}</span>
            </div>

            {/* Back button + Title */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{record.record_name}</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Chi tiết hồ sơ và danh sách phiếu điều trị</p>
                </div>
            </div>

            {/* Record Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Patient Info */}
                <Card className="md:col-span-1">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <User size={18} className="text-blue-600" /> Thông tin bệnh nhân
                    </h3>
                    <div className="space-y-3 text-sm">
                        <div>
                            <p className="text-gray-500">Họ và tên</p>
                            <p className="font-semibold text-gray-900">{record.patient_name}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <p className="text-gray-500">Ngày sinh</p>
                                <p className="font-medium">{record.patient_dob || '—'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Giới tính</p>
                                <p className="font-medium">{record.patient_gender}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-gray-500">Số điện thoại</p>
                            <p className="font-medium">{record.patient_phone || '—'}</p>
                        </div>
                    </div>
                </Card>

                {/* Record Info */}
                <Card className="md:col-span-2">
                    <div className="flex items-start justify-between mb-4">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            <Activity size={18} className="text-green-600" /> Thông tin hồ sơ
                        </h3>
                        <Badge variant={recordStatus.variant}>{recordStatus.label}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500">Số răng</p>
                            <p className="font-medium">🦷 {record.tooth_number || '—'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Ngày bắt đầu</p>
                            <p className="font-medium">📅 {record.start_date}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Ngày kết thúc</p>
                            <p className="font-medium">📅 {record.end_date || 'Chưa xác định'}</p>
                        </div>
                        <div className="md:col-span-3">
                            <p className="text-gray-500 mb-1">Chẩn đoán</p>
                            <p className="font-medium bg-orange-50 px-3 py-2 rounded-lg text-orange-900 border border-orange-100">
                                {record.diagnosis}
                            </p>
                        </div>
                        {record.total_amount > 0 && (
                            <div>
                                <p className="text-gray-500">Tổng chi phí</p>
                                <p className="font-semibold text-green-700">
                                    💰 {record.total_amount.toLocaleString('vi-VN')}đ
                                </p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Treatment list */}
            <Card
                title={`Danh sách phiếu điều trị (${treatments.length})`}
                actions={
                    <Badge variant={treatments.filter(t => t.status === 'PENDING').length > 0 ? 'warning' : 'info'}>
                        {treatments.filter(t => t.status === 'PENDING').length} chờ duyệt
                    </Badge>
                }
            >
                {treatments.length === 0 ? (
                    <div className="py-10 text-center text-gray-400">
                        <p>Chưa có phiếu điều trị nào</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="text-left px-4 py-3 text-gray-600 font-medium">#</th>
                                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Tên phiếu điều trị</th>
                                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Mô tả</th>
                                    <th className="text-right px-4 py-3 text-gray-600 font-medium">Đơn giá</th>
                                    <th className="text-center px-4 py-3 text-gray-600 font-medium">Trạng thái</th>
                                    <th className="text-center px-4 py-3 text-gray-600 font-medium">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {treatments.map((t, idx) => {
                                    const ts = treatmentStatusConfig[t.status] || { label: t.status, variant: 'default', icon: Clock };
                                    const TsIcon = ts.icon;
                                    return (
                                        <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-gray-900">{t.treatment_name}</p>
                                                {t.note && <p className="text-xs text-gray-400 mt-0.5">{t.note}</p>}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 max-w-xs">{t.description}</td>
                                            <td className="px-4 py-3 text-right font-medium text-gray-900">
                                                {(t.unit_price * t.quantity).toLocaleString('vi-VN')}đ
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Badge variant={ts.variant}>
                                                    <TsIcon size={13} className="inline mr-1" />
                                                    {ts.label}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {t.status === 'PENDING' && (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => handleApproveTreatment(t.id)}
                                                            className="px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 text-xs font-medium transition-colors"
                                                        >
                                                            ✓ Duyệt
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectTreatment(t.id)}
                                                            className="px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 text-xs font-medium transition-colors"
                                                        >
                                                            ✕ Từ chối
                                                        </button>
                                                    </div>
                                                )}
                                                {t.status !== 'PENDING' && (
                                                    <span className="text-gray-400 text-xs">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            {treatments.length > 0 && (
                                <tfoot>
                                    <tr className="bg-gray-50 font-semibold">
                                        <td colSpan={3} className="px-4 py-3 text-gray-700">Tổng cộng</td>
                                        <td className="px-4 py-3 text-right text-green-700">
                                            {treatments.reduce((sum, t) => sum + t.unit_price * t.quantity, 0).toLocaleString('vi-VN')}đ
                                        </td>
                                        <td colSpan={2}></td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default DentalRecordDetail;
