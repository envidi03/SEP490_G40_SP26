import { useState, useEffect } from 'react';
import { getAllDentalRecords } from '../../services/dentalRecordService';
import TreatmentListStats from './components/TreatmentListStats';
import RecordTreatmentCard from './components/RecordTreatmentCard';
import TreatmentDetailModal from './components/TreatmentDetailModal';

/**
 * TreatmentList – Danh Sách Phiếu Điều Trị (Minimalist Teal UI)
 *
 * Sử dụng API getAllDentalRecords, trả về các record kèm treatments (qua $lookup)
 * Hiển thị phiếu điều trị mới nhất của mỗi hồ sơ và cho phép xem chi tiết (kể cả đơn thuốc).
 */
const TreatmentList = () => {
    const [records, setRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Pagination
    const [page] = useState(1);
    const [limit] = useState(5);
    const [totalRecords, setTotalRecords] = useState(0);

    // Modal state
    const [selectedTreatment, setSelectedTreatment] = useState(null);

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchTerm), 500);
        return () => clearTimeout(t);
    }, [searchTerm]);

    // Fetch records
    useEffect(() => {
        const fetchTreatments = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const params = {
                    page,
                    limit,
                    search: debouncedSearch || undefined,
                    filter_treatment: statusFilter !== 'ALL' ? statusFilter : undefined
                };

                const res = await getAllDentalRecords(params);
                setRecords(res.data || []);
                setTotalRecords(res.pagination?.totalItems || 0);
            } catch (err) {
                console.error('Error fetching treatments:', err);
                setError('Không thể tải danh sách phiếu điều trị. Vui lòng thử lại.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTreatments();
    }, [debouncedSearch, statusFilter, page, limit]);

    const handleViewDetail = (treatment) => {
        setSelectedTreatment(treatment);
    };

    const handleCloseModal = () => {
        setSelectedTreatment(null);
    };

    return (
        <div className="space-y-6">
            {/* Detail Modal */}
            {selectedTreatment && (
                <TreatmentDetailModal
                    treatment={selectedTreatment}
                    onClose={handleCloseModal}
                />
            )}

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Danh Sách Phiếu Điều Trị</h1>
                <p className="text-xs text-gray-400 mt-0.5">
                    Quản lý toàn bộ phiếu điều trị, được nhóm theo từng hồ sơ nha khoa
                </p>
            </div>

            {/* Filter Tabs */}
            <TreatmentListStats
                activeFilter={statusFilter}
                onFilterChange={setStatusFilter}
            />

            {/* Tìm kiếm & Tổng số */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative w-full md:w-96">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm opacity-60">
                        🔍
                    </span>
                    <input
                        type="text"
                        placeholder="Tìm kiếm phiếu, tên bệnh nhân..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-100 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm transition-shadow"
                    />
                </div>

                <div className="text-sm font-medium text-gray-700 flex items-center gap-3">
                    Hiển thị <span className="text-teal-600 font-bold">{records.length}</span> hồ sơ nha khoa

                    {(statusFilter !== 'ALL' || searchTerm !== '') && (
                        <button
                            onClick={() => { setStatusFilter('ALL'); setSearchTerm(''); }}
                            className="text-xs text-gray-400 hover:text-red-500 underline transition-colors border-l border-gray-200 pl-3"
                        >
                            Xóa bộ lọc
                        </button>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm">
                    {error}
                </div>
            )}

            {/* Content list */}
            {isLoading ? (
                <div className="space-y-4 animate-pulse pt-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-2xl h-32 border border-gray-100" />
                    ))}
                </div>
            ) : records.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-24 text-center mt-6">
                    <div className="text-4xl mb-4 opacity-50">📋</div>
                    <p className="text-sm font-medium text-gray-500">Không tìm thấy phiếu điều trị nào</p>
                    <p className="text-xs text-gray-400 mt-1">
                        {searchTerm || statusFilter !== 'ALL'
                            ? 'Vui lòng thay đổi từ khóa hoặc bộ lọc'
                            : 'Chưa có phiếu điều trị nào được tạo trong hệ thống'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4 pt-2">
                    {records.map(record => (
                        <RecordTreatmentCard
                            key={record._id || record.id}
                            record={record}
                            defaultExpanded={records.length === 1}
                            onViewDetail={handleViewDetail}
                        />
                    ))}

                    {totalRecords > limit && (
                        <div className="text-center pt-4">
                            <span className="text-xs text-gray-400 bg-gray-50 px-4 py-1.5 rounded-full">
                                Hiển thị {limit} kết quả gần nhất. Vui lòng dùng tìm kiếm.
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TreatmentList;
