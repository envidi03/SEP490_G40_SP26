import { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { mockTreatments, mockDentalRecords } from '../../utils/mockData';
import { Search, ClipboardList } from 'lucide-react';
import Card from '../../components/ui/Card';
import TreatmentListStats from './components/TreatmentListStats';
import RecordTreatmentCard from './components/RecordTreatmentCard';

/**
 * TreatmentList – Xem Phiếu Điều Trị
 *
 * Nhóm phiếu theo hồ sơ nha khoa, mỗi hồ sơ là 1 card có thể expand.
 *
 * Sub-components:
 *   TreatmentListStats   – stat cards (cũng là bộ lọc trạng thái)
 *   RecordTreatmentCard  – card từng hồ sơ (expandable)
 *     └─ TreatmentRow    – mỗi dòng phiếu điều trị (chỉ xem)
 */
const TreatmentList = () => {
    const { user } = useAuth();
    const doctorId = user?.id || '696e3df17ea4d06340b4b5e1';

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // ── Nhóm phiếu theo hồ sơ ─────────────────────────────────────────
    const groupedRecords = useMemo(() => {
        const myTreatments = mockTreatments.filter(t => t.doctor_id === doctorId);
        const recordIds = [...new Set(myTreatments.map(t => t.dental_record_id))];

        return recordIds
            .map(recordId => {
                const record = mockDentalRecords.find(r => r.id === recordId);
                if (!record) return null;

                // Lọc phiếu theo status và keyword search
                const recordTreatments = myTreatments
                    .filter(t => t.dental_record_id === recordId)
                    .filter(t => statusFilter === 'ALL' || t.status === statusFilter)
                    .filter(t =>
                        searchTerm === '' ||
                        t.treatment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        t.description.toLowerCase().includes(searchTerm.toLowerCase())
                    );

                // Khi search/filter, bỏ qua hồ sơ không có phiếu nào khớp
                if (statusFilter !== 'ALL' && recordTreatments.length === 0) return null;
                if (searchTerm !== '' && recordTreatments.length === 0) return null;

                // Lấy tất cả phiếu gốc (để đếm stats mini trong card)
                const allRecordTreatments = myTreatments.filter(t => t.dental_record_id === recordId);

                return {
                    record,
                    treatments: recordTreatments,       // phiếu đã filter → hiển thị trong card
                    allTreatments: allRecordTreatments, // tất cả phiếu → cho mini badge counts
                };
            })
            .filter(Boolean)
            .sort((a, b) => {
                // Hồ sơ đang điều trị lên trước
                if (a.record.status === 'IN_PROGRESS' && b.record.status !== 'IN_PROGRESS') return -1;
                if (b.record.status === 'IN_PROGRESS' && a.record.status !== 'IN_PROGRESS') return 1;
                return 0;
            });
    }, [doctorId, searchTerm, statusFilter]);

    // ── Thống kê tổng (tính trên toàn bộ phiếu của doctor) ───────────
    const stats = useMemo(() => {
        const my = mockTreatments.filter(t => t.doctor_id === doctorId);
        return {
            all: my.length,
            pending: my.filter(t => t.status === 'PENDING').length,
            approved: my.filter(t => t.status === 'APPROVED').length,
            rejected: my.filter(t => t.status === 'REJECTED').length,
        };
    }, [doctorId]);

    // ── Render ────────────────────────────────────────────────────────
    return (
        <div className="space-y-6">
            {/* Tiêu đề trang */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Danh Sách Phiếu Điều Trị</h1>
                <p className="text-gray-500 mt-1 text-sm">
                    Danh sách hồ sơ nha khoa — bấm vào từng hồ sơ để xem các phiếu điều trị
                </p>
            </div>

            {/* Stat cards / filter theo status */}
            <TreatmentListStats
                stats={stats}
                activeFilter={statusFilter}
                onFilterChange={setStatusFilter}
            />

            {/* Thanh tìm kiếm */}
            <Card>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm tên phiếu, mô tả..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>
            </Card>

            {/* Tổng số hồ sơ đang hiển thị */}
            <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-700">
                    Hiển thị{' '}
                    <span className="text-blue-600 font-bold">{groupedRecords.length}</span>{' '}
                    hồ sơ nha khoa
                </h2>
                {(statusFilter !== 'ALL' || searchTerm !== '') && (
                    <button
                        onClick={() => { setStatusFilter('ALL'); setSearchTerm(''); }}
                        className="text-sm text-gray-500 hover:text-red-500 underline transition-colors"
                    >
                        Xóa bộ lọc
                    </button>
                )}
            </div>

            {/* Danh sách card hồ sơ */}
            {groupedRecords.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 py-20 text-center">
                    <ClipboardList size={52} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium text-gray-500">Không tìm thấy hồ sơ nào</p>
                    <p className="text-sm text-gray-400 mt-1">
                        {searchTerm || statusFilter !== 'ALL'
                            ? 'Thử thay đổi từ khóa hoặc bộ lọc trạng thái'
                            : 'Chưa có phiếu điều trị nào được tạo'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {groupedRecords.map(({ record, treatments, allTreatments }) => (
                        <RecordTreatmentCard
                            key={record.id}
                            record={record}
                            treatments={treatments}
                            allTreatments={allTreatments}
                            defaultExpanded={groupedRecords.length === 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default TreatmentList;
