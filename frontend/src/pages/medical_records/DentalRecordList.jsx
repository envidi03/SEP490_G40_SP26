import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { getAllDentalRecords } from '../../services/dentalRecordService';
import { FilePlus, ChevronRight, Phone, Activity, Loader2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import CreateDentalRecordModal from './components/CreateDentalRecordModal';
import DentalRecordFilter from './components/DentalRecordFilter';
import DentalRecordCard from './components/DentalRecordCard';
import DentalRecordPagination from './components/DentalRecordPagination';

const PAGE_SIZE = 5;

const DentalRecordList = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const queryName = searchParams.get('name') || '';
    const queryPhone = searchParams.get('phone') || '';

    // ── State ──────────────────────────────────────────────────────
    const [records, setRecords] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalItems: 0 });
    const [currentPage, setCurrentPage] = useState(1);

    // Filter/search state
    const [inputValue, setInputValue] = useState(queryName);
    const [searchTerm, setSearchTerm] = useState(queryName);
    const [statusFilter, setStatusFilter] = useState('');
    const [treatmentFilter, setTreatmentFilter] = useState('');
    const [sortOrder, setSortOrder] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const isPatientContext = Boolean(queryName);
    const totalPages = Math.ceil((pagination.totalItems || 0) / PAGE_SIZE);

    // ── Fetch ──────────────────────────────────────────────────────
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
            setRecords(res.data ?? []);
            setPagination(res.pagination ?? { page: 1, totalItems: 0 });
        } catch (err) {
            console.error('Error fetching dental records:', err);
            setError('Không thể tải danh sách hồ sơ. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, statusFilter, treatmentFilter, sortOrder]);

    useEffect(() => { fetchRecords(currentPage); }, [fetchRecords, currentPage]);
    useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, treatmentFilter, sortOrder]);

    // Debounce search input 400ms
    useEffect(() => {
        const t = setTimeout(() => setSearchTerm(inputValue), 400);
        return () => clearTimeout(t);
    }, [inputValue]);

    // ── Handlers ──────────────────────────────────────────────────
    const handleClearFilter = () => {
        setInputValue('');
        setStatusFilter('');
        setTreatmentFilter('');
        setSortOrder('');
    };

    const handleCreateSuccess = (newRecord) => {
        setIsCreateModalOpen(false);
        navigate(`/dentist/dental-records/${newRecord._id}`);
    };

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

            {/* Search + Filter */}
            <DentalRecordFilter
                inputValue={inputValue} onInputChange={setInputValue}
                statusFilter={statusFilter} onStatusChange={setStatusFilter}
                treatmentFilter={treatmentFilter} onTreatmentChange={setTreatmentFilter}
                sortOrder={sortOrder} onSortChange={setSortOrder}
                onClear={handleClearFilter}
            />

            {/* Result count */}
            <div className="text-sm text-gray-600">
                Tìm thấy <strong className="text-blue-600">{pagination.totalItems ?? 0}</strong> hồ sơ
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
                    <button onClick={() => fetchRecords(currentPage)} className="underline font-medium">
                        Thử lại
                    </button>
                </div>
            )}

            {/* Empty state */}
            {!isLoading && !error && records.length === 0 && (
                <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-500">
                    <Activity size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Chưa có hồ sơ nha khoa</p>
                    <p className="text-sm mt-1">Bấm "Tạo Hồ Sơ Mới" để thêm hồ sơ đầu tiên</p>
                </div>
            )}

            {/* Record list */}
            {!isLoading && !error && records.length > 0 && (
                <div className="space-y-4">
                    {records.map(record => (
                        <DentalRecordCard key={record._id} record={record} />
                    ))}
                </div>
            )}

            {/* Pagination */}
            <DentalRecordPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

            {/* Create modal */}
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
