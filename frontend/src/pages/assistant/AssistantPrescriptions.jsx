import { useState, useEffect, useCallback, useRef } from 'react';
import { Pill, Search, Eye, Edit, CheckCircle, Clock, AlertCircle, X, Plus, Trash2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import treatmentService from '../../services/treatmentService';
import { ViewMedicineModal, EditMedicineModal } from './modals/AssistantPrescriptionModals';

// ─── STATUS HELPERS ──────────────────────────────────────────────────────────
const getStatusInfo = (status) => {
    const map = {
        PLANNED: { label: 'Kế hoạch', variant: 'default', icon: Clock },
        WAITING_APPROVAL: { label: 'Chờ duyệt', variant: 'warning', icon: Clock },
        APPROVED: { label: 'Đã duyệt', variant: 'primary', icon: CheckCircle },
        IN_PROGRESS: { label: 'Đang thực hiện', variant: 'warning', icon: AlertCircle },
        DONE: { label: 'Hoàn thành', variant: 'success', icon: CheckCircle },
        CANCELLED: { label: 'Đã hủy', variant: 'danger', icon: X },
        REJECTED: { label: 'Bị từ chối', variant: 'danger', icon: X },
    };
    return map[status] || { label: status, variant: 'default', icon: Clock };
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const AssistantPrescriptions = () => {
    const [dentalRecords, setDentalRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');

    const [viewTreatment, setViewTreatment] = useState(null);
    const [editTreatment, setEditTreatment] = useState(null);

    const fetchRecords = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await treatmentService.getAllDentalRecordsWithTreatments({
                limit: 100,
                filter_dental_record: 'IN_PROGRESS',
            });
            const raw = res?.data;
            const records = Array.isArray(raw) ? raw : (raw?.data || []);
            setDentalRecords(records);
        } catch (err) {
            console.error('Fetch dental records:', err);
            setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchRecords(); }, [fetchRecords]);

    // Flatten to rows: only IN_PROGRESS treatments from IN_PROGRESS records
    const rows = dentalRecords.flatMap((record) =>
        (record.treatments || [])
            .filter((t) => t.status === 'IN_PROGRESS')
            .map((t) => ({ ...t, _record: record }))
    );

    // Apply search / date filter
    const filtered = rows.filter((row) => {
        const q = searchTerm.toLowerCase();
        const matchSearch = !q ||
            row._record?.full_name?.toLowerCase().includes(q) ||
            row._record?.phone?.includes(q) ||
            row._record?.record_name?.toLowerCase().includes(q) ||
            row.tooth_position?.toLowerCase().includes(q) ||
            row.note?.toLowerCase().includes(q);

        const matchDate = !filterDate ||
            (row.performed_date && new Date(row.performed_date).toISOString().startsWith(filterDate)) ||
            (row.planned_date && new Date(row.planned_date).toISOString().startsWith(filterDate));

        return matchSearch && matchDate;
    });

    // Stats
    const totalMeds = filtered.reduce((acc, t) => acc + (t.medicine_usage || []).length, 0);
    const dispensedMeds = filtered.reduce((acc, t) => acc + (t.medicine_usage || []).filter((m) => m.dispensed).length, 0);
    const pendingMeds = totalMeds - dispensedMeds;

    return (
        <div>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Quản Lý Đơn Thuốc</h1>
                    <p className="text-gray-600 mt-1">Kê đơn và cấp phát thuốc cho bệnh nhân đang điều trị</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Phiếu đang điều trị</p>
                            <p className="text-3xl font-bold text-blue-600 mt-1">{filtered.length}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full"><Pill size={24} className="text-blue-600" /></div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Thuốc đã cấp phát</p>
                            <p className="text-3xl font-bold text-green-600 mt-1">{dispensedMeds}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full"><CheckCircle size={24} className="text-green-600" /></div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Thuốc chưa cấp phát</p>
                            <p className="text-3xl font-bold text-amber-600 mt-1">{pendingMeds}</p>
                        </div>
                        <div className="p-3 bg-amber-100 rounded-full"><Clock size={24} className="text-amber-600" /></div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Tên bệnh nhân, SĐT, tên hồ sơ, vị trí răng..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ngày thực hiện</label>
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>
            </Card>

            {/* Error */}
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-[13px] mb-4">{error}</div>
            )}

            {/* Table */}
            <Card>
                {isLoading ? (
                    <div className="space-y-3 p-5 animate-pulse">
                        <div className="h-10 bg-gray-100 rounded-xl" />
                        <div className="h-16 bg-gray-50 rounded-xl" />
                        <div className="h-16 bg-gray-50 rounded-xl" />
                    </div>
                ) : filtered.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Bệnh nhân</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hồ sơ / Phiếu</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày thực hiện</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Số thuốc</th>
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map((row) => {
                                    const statusInfo = getStatusInfo(row.status);
                                    const StatusIcon = statusInfo.icon;
                                    const meds = row.medicine_usage || [];
                                    const dispensed = meds.filter((m) => m.dispensed).length;

                                    return (
                                        <tr key={row._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-3.5 px-4">
                                                <p className="font-semibold text-gray-900 text-sm">{row._record?.full_name || '—'}</p>
                                                <p className="text-xs text-gray-500">{row._record?.phone || ''}</p>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <p className="text-sm font-medium text-gray-700 max-w-[200px] truncate">{row._record?.record_name || '—'}</p>
                                                <p className="text-xs text-gray-400 truncate max-w-[200px]">{row.tooth_position || row.note || 'Phiếu điều trị'}</p>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <p className="text-sm text-gray-600">
                                                    {row.performed_date
                                                        ? new Date(row.performed_date).toLocaleDateString('vi-VN')
                                                        : row.planned_date
                                                            ? new Date(row.planned_date).toLocaleDateString('vi-VN')
                                                            : '—'}
                                                </p>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                {meds.length > 0 ? (
                                                    <span className="inline-flex items-center justify-center gap-1.5">
                                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold text-sm">{meds.length}</span>
                                                        <span className="text-xs text-gray-400">{dispensed}/{meds.length} cấp</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-amber-500 italic">Chưa kê</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <Badge variant={statusInfo.variant}>
                                                    <StatusIcon size={14} className="inline mr-1" />
                                                    {statusInfo.label}
                                                </Badge>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="flex justify-center gap-1">
                                                    {meds.length > 0 && (
                                                        <button
                                                            onClick={() => setViewTreatment(row)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Xem chi tiết đơn thuốc"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setEditTreatment(row)}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Kê / Chỉnh sửa đơn thuốc"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <Pill size={48} className="mx-auto text-gray-300 mb-4" />
                        <p>Không có phiếu điều trị nào đang thực hiện</p>
                    </div>
                )}
            </Card>

            {/* Modals */}
            <ViewMedicineModal
                treatment={viewTreatment}
                isOpen={!!viewTreatment}
                onClose={() => setViewTreatment(null)}
            />
            <EditMedicineModal
                treatment={editTreatment}
                isOpen={!!editTreatment}
                onClose={() => setEditTreatment(null)}
                onSave={fetchRecords}
            />
        </div>
    );
};

export default AssistantPrescriptions;
