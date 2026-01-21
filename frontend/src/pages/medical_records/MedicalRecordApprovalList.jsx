import React, { useState, useMemo } from 'react';
import { ClipboardCheck, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { getMedicalRecordsPendingApproval } from '../../utils/mockData';
import ApprovalRecordCard from './components/ApprovalRecordCard';

const MedicalRecordApprovalList = () => {
    const { user } = useAuth();
    const [records, setRecords] = useState(() => getMedicalRecordsPendingApproval(user?.id || ''));
    const [filter, setFilter] = useState('ALL'); // ALL, PENDING, REVIEWED

    // Mock filter function (in real app would fetch from DB)
    const filteredRecords = useMemo(() => {
        if (filter === 'ALL') return records;
        if (filter === 'PENDING') return records.filter(r => r.status === 'PENDING');
        return records.filter(r => r.status !== 'PENDING');
    }, [records, filter]);

    const handleApprove = async (recordId) => {
        // In a real app, this would call an API
        console.log('Approving record:', recordId);

        setRecords(prevRecords =>
            prevRecords.map(record =>
                record.id === recordId
                    ? { ...record, status: 'APPROVED', approved_by: user.id, approved_at: new Date().toISOString() }
                    : record
            )
        );

        // Show success message
        alert('Hồ sơ đã được phê duyệt thành công!');
    };

    const handleReject = async (recordId, reason) => {
        // In a real app, this would call an API
        console.log('Rejecting record:', recordId, 'Reason:', reason);

        setRecords(prevRecords =>
            prevRecords.map(record =>
                record.id === recordId
                    ? { ...record, status: 'REJECTED', approved_by: user.id, approved_at: new Date().toISOString(), rejectionReason: reason }
                    : record
            )
        );

        // Show success message
        alert('Hồ sơ đã bị từ chối!');
    };

    // Stats
    const stats = useMemo(() => ({
        total: records.length,
        pending: records.filter(r => r.status === 'PENDING').length,
        approved: records.filter(r => r.status === 'APPROVED').length,
        rejected: records.filter(r => r.status === 'REJECTED').length,
    }), [records]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <ClipboardCheck size={32} className="text-blue-600" />
                    Phê duyệt Hồ sơ Nha khoa
                </h1>
                <p className="text-gray-600 mt-1">Xem xét và phê duyệt các hồ sơ do trợ lý/lễ tân tạo</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600 font-medium">Tổng số</p>
                            <p className="text-3xl font-bold text-blue-700">{stats.total}</p>
                        </div>
                        <AlertCircle size={40} className="text-blue-400" />
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-yellow-600 font-medium">Chờ duyệt</p>
                            <p className="text-3xl font-bold text-yellow-700">{stats.pending}</p>
                        </div>
                        <ClipboardCheck size={40} className="text-yellow-400" />
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-600 font-medium">Đã duyệt</p>
                            <p className="text-3xl font-bold text-green-700">{stats.approved}</p>
                        </div>
                        <CheckCircle size={40} className="text-green-400" />
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-red-600 font-medium">Từ chối</p>
                            <p className="text-3xl font-bold text-red-700">{stats.rejected}</p>
                        </div>
                        <XCircle size={40} className="text-red-400" />
                    </div>
                </Card>
            </div>

            {/* Filter Tabs */}
            <Card>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('ALL')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'ALL'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Tất cả ({stats.total})
                    </button>
                    <button
                        onClick={() => setFilter('PENDING')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'PENDING'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Chờ duyệt ({stats.pending})
                    </button>
                    <button
                        onClick={() => setFilter('REVIEWED')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'REVIEWED'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Đã xem xét ({stats.approved + stats.rejected})
                    </button>
                </div>
            </Card>

            {/* Records List */}
            {filteredRecords.length === 0 ? (
                <Card>
                    <div className="text-center py-12">
                        <ClipboardCheck size={64} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">Không có hồ sơ nào cần phê duyệt</p>
                    </div>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredRecords.map(record => (
                        <ApprovalRecordCard
                            key={record.id}
                            record={record}
                            onApprove={handleApprove}
                            onReject={handleReject}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MedicalRecordApprovalList;
