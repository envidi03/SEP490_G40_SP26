import { useNavigate } from 'react-router-dom';
import { Eye, User, Phone } from 'lucide-react';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';

const statusConfig = {
    IN_PROGRESS: { label: 'Đang điều trị', variant: 'warning' },
    COMPLETED: { label: 'Hoàn thành', variant: 'success' },
    CANCELLED: { label: 'Đã hủy', variant: 'danger' },
};

const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('vi-VN');
};

/**
 * DentalRecordCard
 * Hiển thị thông tin tóm tắt 1 hồ sơ nha khoa + nút Xem chi tiết
 *
 * Props:
 *   record – dental record object từ API
 */
const DentalRecordCard = ({ record }) => {
    const navigate = useNavigate();
    const statusInfo = statusConfig[record.status] || { label: record.status, variant: 'default' };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: info */}
                    <div className="flex-1 space-y-2">
                        {/* Tên hồ sơ + trạng thái */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900">{record.record_name}</h3>
                            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        </div>

                        {/* Thông tin bệnh nhân */}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                                <User size={14} className="text-gray-400" />
                                <strong>{record.full_name}</strong>
                            </span>
                            {record.phone && (
                                <span className="flex items-center gap-1">
                                    <Phone size={14} className="text-gray-400" />
                                    {record.phone}
                                </span>
                            )}
                            {record.created_by?.full_name && (
                                <span className="text-gray-400">
                                    👨‍⚕️ {record.created_by.full_name}
                                </span>
                            )}
                        </div>

                        {/* Mô tả */}
                        {record.description && (
                            <p className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg line-clamp-2">
                                {record.description}
                            </p>
                        )}

                        {/* Ngày tháng + số phiếu */}
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                            <span>📅 Tạo: {formatDate(record.createdAt)}</span>
                            {record.start_date && <span>▶ Bắt đầu: {formatDate(record.start_date)}</span>}
                            {record.end_date && <span>⏹ Kết thúc: {formatDate(record.end_date)}</span>}
                            {record.treatment_list?.length > 0 && (
                                <span>🦷 {record.treatment_list.length} phiếu điều trị</span>
                            )}
                        </div>
                    </div>

                    {/* Right: Xem chi tiết */}
                    <Button
                        onClick={() => navigate(`/dentist/dental-records/${record._id}`)}
                        className="flex items-center gap-2 flex-shrink-0 self-start md:self-center"
                    >
                        <Eye size={16} />
                        Xem chi tiết
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DentalRecordCard;
