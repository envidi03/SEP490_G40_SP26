import { useState, useEffect, useMemo, useCallback } from 'react';
import { getAllDentalRecords, updateTreatmentStatus } from '../../services/dentalRecordService';

import ApprovalStats from './components/ApprovalStats';
import RecordApprovalCard from './components/RecordApprovalCard';
import Toast from '../../components/ui/Toast';

const TreatmentApproval = () => {
    const [records, setRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processingIds, setProcessingIds] = useState([]);
    const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

    // Mặc định hiển thị WAITING_APPROVAL
    const [statusFilter, setStatusFilter] = useState('WAITING_APPROVAL');

    const showToast = (type, message) => setToast({ show: true, type, message });
    const closeToast = () => setToast(prev => ({ ...prev, show: false }));

    // ── Fetch ────────────────────────────────────────────────────────
    const fetchRecords = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Luôn fetch với filter WAITING_APPROVAL từ backend để chỉ lấy
            // những hồ sơ có ít nhất 1 phiếu đang chờ duyệt
            const params = {
                page: 1,
                limit: 50,
                filter_treatment: 'WAITING_APPROVAL',
            };
            const res = await getAllDentalRecords(params);
            setRecords(res.data || []);
        } catch (err) {
            console.error('Lỗi khi tải dữ liệu phê duyệt:', err);
            setError('Không thể tải dữ liệu phiếu điều trị. Vui lòng thử lại sau.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    // ── Handlers ─────────────────────────────────────────────────────
    const processTreatmentAction = async (treatmentId, newStatus) => {
        setProcessingIds(prev => [...prev, treatmentId]);
        try {
            await updateTreatmentStatus(treatmentId, newStatus);
            showToast('success', `Đã ${newStatus === 'APPROVED' ? 'phê duyệt' : 'từ chối'} phiếu điều trị!`);

            // Optimistic update: cập nhật status ngay lập tức
            setRecords(prevRecords =>
                prevRecords.map(record => {
                    if (!record.treatments) return record;
                    const updatedTreatments = record.treatments.map(t =>
                        (t._id === treatmentId || t.id === treatmentId)
                            ? { ...t, status: newStatus }
                            : t
                    );
                    return { ...record, treatments: updatedTreatments };
                })
            );
        } catch (err) {
            console.error(`Lỗi khi ${newStatus} phiếu ${treatmentId}:`, err);
            showToast('error', 'Không thể xử lý yêu cầu. Vui lòng thử lại!');
        } finally {
            setProcessingIds(prev => prev.filter(id => id !== treatmentId));
        }
    };

    const handleApprove = (treatmentId) => processTreatmentAction(treatmentId, 'APPROVED');
    const handleReject = (treatmentId) => {
        if (window.confirm('Bạn có chắc chắn muốn từ chối phiếu điều trị này?')) {
            processTreatmentAction(treatmentId, 'REJECTED');
        }
    };

    // ── Stats (tính từ toàn bộ records đã fetch) ─────────────────────
    const stats = useMemo(() => {
        let WAITING_APPROVAL = 0, APPROVED = 0, REJECTED = 0;
        records.forEach(r => {
            (r.treatments || []).forEach(t => {
                if (t.status === 'WAITING_APPROVAL') WAITING_APPROVAL++;
                if (t.status === 'APPROVED') APPROVED++;
                if (t.status === 'REJECTED') REJECTED++;
            });
        });
        return { WAITING_APPROVAL, APPROVED, REJECTED };
    }, [records]);

    // ── Records hiển thị dựa theo filter tab đang chọn ───────────────
    // Khi chọn WAITING_APPROVAL → ẩn các record không còn phiếu nào chờ duyệt (do optimistic update)
    const displayRecords = useMemo(() => {
        return records.filter(r => {
            if (!r.treatments || r.treatments.length === 0) return false;
            return r.treatments.some(t => t.status === statusFilter);
        });
    }, [records, statusFilter]);

    // ── Render ────────────────────────────────────────────────────────
    return (
        <div className="space-y-6">
            <Toast
                show={toast.show}
                type={toast.type}
                message={toast.message}
                onClose={closeToast}
            />

            {/* Page header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Phê Duyệt Phiếu Điều Trị</h1>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Kiểm tra và quyết định phê duyệt các dịch vụ điều trị được đề xuất
                    </p>
                </div>

                {/* Refresh button */}
                <button
                    onClick={fetchRecords}
                    disabled={isLoading}
                    className="self-start md:self-auto flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:border-teal-300 hover:text-teal-600 transition-all duration-200 disabled:opacity-50"
                >
                    <span className={isLoading ? 'animate-spin' : ''}>↻</span>
                    Làm mới
                </button>
            </div>

            {/* Stats & filter tabs */}
            <ApprovalStats
                stats={stats}
                activeFilter={statusFilter}
                onFilterChange={setStatusFilter}
            />

            {/* Count & info */}
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">
                    {statusFilter === 'WAITING_APPROVAL' && (
                        <>Đang hiển thị <span className="text-amber-600 font-bold">{displayRecords.length}</span> hồ sơ có phiếu chờ duyệt</>
                    )}
                    {statusFilter === 'APPROVED' && (
                        <>Đang hiển thị <span className="text-teal-600 font-bold">{displayRecords.length}</span> hồ sơ có phiếu đã duyệt</>
                    )}
                    {statusFilter === 'REJECTED' && (
                        <>Đang hiển thị <span className="text-red-600 font-bold">{displayRecords.length}</span> hồ sơ có phiếu từ chối</>
                    )}
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm">
                    {error}
                </div>
            )}

            {/* List */}
            {isLoading ? (
                <div className="space-y-4 animate-pulse pt-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-2xl h-32 border-2 border-gray-100" />
                    ))}
                </div>
            ) : displayRecords.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-24 text-center mt-4">
                    <div className="text-4xl mb-4 opacity-40">
                        {statusFilter === 'WAITING_APPROVAL'}
                    </div>
                    <p className="text-sm font-semibold text-gray-500">
                        {statusFilter === 'WAITING_APPROVAL'
                            ? 'Không còn phiếu nào chờ phê duyệt!'
                            : 'Không có hồ sơ nào khớp với bộ lọc hiện tại'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        {statusFilter === 'WAITING_APPROVAL'
                            ? 'Tất cả phiếu điều trị đã được xử lý'
                            : 'Thử chọn bộ lọc khác bên trên'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4 pt-1">
                    {displayRecords.map(record => (
                        <RecordApprovalCard
                            key={record._id || record.id}
                            record={record}
                            filterStatus={statusFilter}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            processingIds={processingIds}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default TreatmentApproval;
