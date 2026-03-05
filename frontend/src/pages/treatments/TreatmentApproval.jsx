import { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { mockTreatments, mockDentalRecords } from '../../utils/mockData';
import { CheckSquare } from 'lucide-react';

import ApprovalStats from './components/ApprovalStats';
import RecordApprovalCard from './components/RecordApprovalCard';
let localTreatments = mockTreatments.map(t => ({ ...t }));

const TreatmentApproval = () => {
    const { user } = useAuth();
    const doctorId = user?.id || '696e3df17ea4d06340b4b5e1';

    const [treatments, setTreatments] = useState(localTreatments);

    // ── Handlers ────────────────────────────────────────────────────
    const handleApprove = (treatmentId) => {
        const updated = treatments.map(t =>
            t.id === treatmentId
                ? { ...t, status: 'APPROVED', approved_at: new Date().toISOString() }
                : t
        );
        localTreatments = updated;
        setTreatments(updated);
    };

    const handleReject = (treatmentId) => {
        const reason = window.prompt('Nhập lý do từ chối phiếu điều trị:');
        if (reason === null) return; // user cancelled prompt
        const updated = treatments.map(t =>
            t.id === treatmentId
                ? {
                    ...t,
                    status: 'REJECTED',
                    note: (t.note ? t.note + ' | ' : '') + 'Từ chối: ' + reason,
                    approved_at: new Date().toISOString(),
                }
                : t
        );
        localTreatments = updated;
        setTreatments(updated);
    };

    // ── Build grouped data ──────────────────────────────────────────
    // Chỉ hiển thị hồ sơ còn ít nhất 1 phiếu PENDING (chưa duyệt hết)
    const groupedRecords = useMemo(() => {
        const myTreatments = treatments.filter(t => t.doctor_id === doctorId);
        const recordIds = [...new Set(myTreatments.map(t => t.dental_record_id))];

        return recordIds
            .map(recordId => {
                const record = mockDentalRecords.find(r => r.id === recordId);
                if (!record) return null;

                const recordTreatments = myTreatments.filter(t => t.dental_record_id === recordId);

                // BẮT BUỘC: hồ sơ phải còn ít nhất 1 phiếu PENDING
                const hasPending = recordTreatments.some(t => t.status === 'PENDING');
                if (!hasPending) return null;

                return { record, treatments: recordTreatments };
            })
            .filter(Boolean)
            .sort((a, b) => {
                // Hồ sơ có nhiều phiếu PENDING hơn lên trước
                const aPending = a.treatments.filter(t => t.status === 'PENDING').length;
                const bPending = b.treatments.filter(t => t.status === 'PENDING').length;
                return bPending - aPending;
            });
    }, [treatments, doctorId]);

    // ── Stats ───────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const my = treatments.filter(t => t.doctor_id === doctorId);
        // Đếm trên từng phiếu (không gộp theo hồ sơ)
        const totalPendingTreatments = my.filter(t => t.status === 'PENDING').length;
        const totalApprovedTreatments = my.filter(t => t.status === 'APPROVED').length;
        const totalRejectedTreatments = my.filter(t => t.status === 'REJECTED').length;
        return {
            all: groupedRecords.length,          // tổng hồ sơ còn chờ
            pending: totalPendingTreatments,          // tổng phiếu chờ duyệt
            approved: totalApprovedTreatments,         // tổng phiếu đã duyệt
            rejected: totalRejectedTreatments,         // tổng phiếu từ chối
        };
    }, [treatments, doctorId, groupedRecords]);

    // ── Render ───────────────────────────────────────────────────────
    return (
        <div className="space-y-6">
            {/* Page header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Phê Duyệt Phiếu Điều Trị</h1>
                <p className="text-gray-500 mt-1 text-sm">
                    Chỉ hiển thị hồ sơ còn phiếu điều trị chờ phê duyệt — bấm vào từng hồ sơ để xem và xử lý
                </p>
            </div>

            {/* Summary strip – không phải filter, chỉ là thông tin nhanh */}
            <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl border bg-yellow-50 border-yellow-200 text-yellow-700 p-4">
                    <p className="text-2xl font-bold">{stats.pending}</p>
                    <p className="text-sm font-medium mt-0.5">Phiếu chờ duyệt</p>
                </div>
                <div className="rounded-xl border bg-green-50 border-green-200 text-green-700 p-4">
                    <p className="text-2xl font-bold">{stats.approved}</p>
                    <p className="text-sm font-medium mt-0.5">Phiếu đã duyệt</p>
                </div>
                <div className="rounded-xl border bg-red-50 border-red-200 text-red-700 p-4">
                    <p className="text-2xl font-bold">{stats.rejected}</p>
                    <p className="text-sm font-medium mt-0.5">Phiếu từ chối</p>
                </div>
            </div>

            {/* Record count header */}
            <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-gray-700">
                    Có <span className="text-yellow-600 font-bold">{groupedRecords.length}</span> hồ sơ đang chờ phê duyệt
                </h2>
            </div>

            {/* Empty state */}
            {groupedRecords.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 py-20 text-center text-gray-400">
                    <CheckSquare size={52} className="mx-auto mb-4 text-green-300" />
                    <p className="text-lg font-medium text-gray-500">Tất cả phiếu đã được xử lý!</p>
                    <p className="text-sm mt-1 text-gray-400">Không còn hồ sơ nào có phiếu điều trị chờ phê duyệt</p>
                </div>
            ) : (
                /* Record cards */
                <div className="space-y-4">
                    {groupedRecords.map(({ record, treatments: recTreatments }) => (
                        <RecordApprovalCard
                            key={record.id}
                            record={record}
                            treatments={recTreatments}
                            filterStatus="ALL"
                            onApprove={handleApprove}
                            onReject={handleReject}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default TreatmentApproval;
