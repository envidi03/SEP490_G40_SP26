import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { getAllDentalRecords } from '../../services/dentalRecordService';
import { Search, FilePlus, Eye, ChevronRight, User, Calendar, Phone, Activity, ChevronLeft, Loader2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import CreateDentalRecordModal from './components/CreateDentalRecordModal';

const statusConfig = {
    IN_PROGRESS: { label: 'Đang điều trị', variant: 'warning' },
    COMPLETED: { label: 'Hoàn thành', variant: 'success' },
    CANCELLED: { label: 'Đã hủy', variant: 'danger' },
};

const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('vi-VN');
};

const PAGE_SIZE = 5;

const DentalRecordList = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const queryName = searchParams.get('name') || '';
    const queryPhone = searchParams.get('phone') || '';

    const [records, setRecords] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalItems: 0 });
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState(queryName);
    const [statusFilter, setStatusFilter] = useState('');
    const [treatmentFilter, setTreatmentFilter] = useState('');
    const [sortOrder, setSortOrder] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const isPatientContext = Boolean(queryName);

    const fetchRecords = useCallback(async (page = 1) => {
        setIsLoading(true);
        setError(null);
        try {
            const params = {
                page,
                limit: PAGE_SIZE,
                ...(searchTerm && { search: searchTerm }),
                ...(statusFilter && { filter_dental_record: statusFilter }),
                ...(treatmentFilter && { filter_treatment: treatmentFilter }),
                ...(sortOrder && { sort: sortOrder }),
            };
            const res = await getAllDentalRecords(params);
            // API response shape: { data: [...], pagination: { page, size, totalItems } }
            setRecords(res.data ?? []);
            setPagination(res.pagination ?? { page: 1, totalItems: 0 });
        } catch (err) {
            console.error('Error fetching dental records:', err);
            setError('Không thể tải danh sách hồ sơ. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, statusFilter, treatmentFilter, sortOrder]);

    // Refetch when page/search/filter changes
    useEffect(() => {
        fetchRecords(currentPage);
    }, [fetchRecords, currentPage]);

    // Reset to page 1 when search/filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, treatmentFilter, sortOrder]);

    // ── Search with debounce ───────────────────────────────────────
    const [inputValue, setInputValue] = useState(queryName);
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchTerm(inputValue);
        }, 400);
        return () => clearTimeout(timer);
    }, [inputValue]);

    // ── Handlers ──────────────────────────────────────────────────
    const handleCreateSuccess = (newRecord) => {
        setIsCreateModalOpen(false);
        navigate(`/dentist/dental-records/${newRecord._id}`);
    };

    const totalPages = Math.ceil((pagination.totalItems || 0) / PAGE_SIZE);

    // ── Render ────────────────────────────────────────────────────
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
                    {isPatientContext && queryPhone && (
                        <p className="text-gray-500 mt-1 text-sm flex items-center gap-1">
                            <Phone size={13} /> {queryPhone}
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

            {/* Patient context notice */}
            {isPatientContext && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                    <strong>Lưu ý:</strong> Hiển thị tất cả hồ sơ tìm theo&nbsp;
                    <strong>"{queryName}"</strong>.
                    Nếu có nhiều hồ sơ trùng tên, kiểm tra ngày sinh và giới tính để xác định đúng bệnh nhân.
                </div>
            )}

            {/* Search + filter */}
            <Card>
                <div className="flex flex-col gap-3">
                    {/* Row 1: Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm theo tên hồ sơ, tên bác sĩ, vị trí răng..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>

                    {/* Row 2: Filters + Sort */}
                    <div className="flex flex-wrap gap-3 items-center">
                        {/* filter_dental_record */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                            <option value="">🗂 Trạng thái hồ sơ</option>
                            <option value="IN_PROGRESS">Đang điều trị</option>
                            <option value="COMPLETED">Hoàn thành</option>
                            <option value="CANCELLED">Đã hủy</option>
                        </select>

                        {/* filter_treatment */}
                        <select
                            value={treatmentFilter}
                            onChange={(e) => setTreatmentFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                            <option value="">💊 Trạng thái phiếu</option>
                            <option value="PENDING">Chờ phê duyệt</option>
                            <option value="APPROVED">Đã duyệt</option>
                            <option value="REJECTED">Từ chối</option>
                        </select>

                        {/* sort by start_date */}
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                            <option value="">📅 Sắp xếp ngày bắt đầu</option>
                            <option value="asc">Cũ nhất trước</option>
                            <option value="desc">Mới nhất trước</option>
                        </select>

                        {(inputValue || statusFilter || treatmentFilter || sortOrder) && (
                            <button
                                onClick={() => { setInputValue(''); setStatusFilter(''); setTreatmentFilter(''); setSortOrder(''); }}
                                className="text-sm text-red-500 hover:text-red-700 underline whitespace-nowrap"
                            >
                                Xóa tất cả
                            </button>
                        )}
                    </div>
                </div>
            </Card>

            {/* Result count */}
            <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                    Tìm thấy <strong className="text-blue-600">{pagination.totalItems ?? 0}</strong> hồ sơ
                </span>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="flex justify-center py-16">
                    <Loader2 size={36} className="animate-spin text-blue-500" />
                </div>
            )}

            {/* Error */}
            {error && !isLoading && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => fetchRecords(currentPage)} className="underline font-medium">Thử lại</button>
                </div>
            )}

            {/* Empty state */}
            {!isLoading && !error && records.length === 0 && (
                <Card>
                    <div className="py-16 text-center text-gray-500">
                        <Activity size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">Chưa có hồ sơ nha khoa</p>
                        <p className="text-sm mt-1">Bấm "Tạo Hồ Sơ Mới" để thêm hồ sơ đầu tiên</p>
                    </div>
                </Card>
            )}

            {/* Record cards */}
            {!isLoading && !error && records.length > 0 && (
                <div className="space-y-4">
                    {records.map(record => {
                        const statusInfo = statusConfig[record.status] || { label: record.status, variant: 'default' };
                        return (
                            <div
                                key={record._id}
                                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="p-5">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        {/* Left: info */}
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-semibold text-gray-900">{record.record_name}</h3>
                                                <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                                            </div>

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

                                            {record.description && (
                                                <p className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg line-clamp-2">
                                                    {record.description}
                                                </p>
                                            )}

                                            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                                                <span>📅 Tạo: {formatDate(record.createdAt)}</span>
                                                {record.start_date && <span>▶ Bắt đầu: {formatDate(record.start_date)}</span>}
                                                {record.end_date && <span>⏹ Kết thúc: {formatDate(record.end_date)}</span>}
                                                {record.treatment_list?.length > 0 && (
                                                    <span>🦷 {record.treatment_list.length} phiếu điều trị</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right: action */}
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
                    })}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <button
                            key={p}
                            onClick={() => setCurrentPage(p)}
                            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === currentPage
                                ? 'bg-blue-600 text-white'
                                : 'hover:bg-gray-100 text-gray-700'
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}

            {/* Create Dental Record Modal */}
            <CreateDentalRecordModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateSuccess}
                defaultName={queryName}
                defaultPhone={queryPhone}
            />
        </div>
    );
};

export default DentalRecordList;
