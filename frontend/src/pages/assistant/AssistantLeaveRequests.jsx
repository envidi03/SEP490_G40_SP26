import { useState } from 'react';
import { Clock, Plus, Edit, Trash2, Send, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import LeaveRequestModal from './modals/LeaveRequestModal';

// Mock leave requests data
const mockLeaveRequests = [
    {
        id: 'leave_001',
        startDate: '2026-01-20',
        endDate: '2026-01-22',
        leaveType: 'annual',
        reason: 'Nghỉ phép năm',
        status: 'approved',
        submittedAt: '2026-01-10',
        approvedBy: 'Quản lý',
        approvedAt: '2026-01-11',
        isDraft: false
    },
    {
        id: 'leave_002',
        startDate: '2026-02-01',
        endDate: '2026-02-02',
        leaveType: 'sick',
        reason: 'Khám sức khỏe định kỳ',
        status: 'pending',
        submittedAt: '2026-01-15',
        isDraft: false
    },
    {
        id: 'leave_003',
        startDate: '2026-03-15',
        endDate: '2026-03-15',
        leaveType: 'personal',
        reason: 'Việc gia đình cá nhân',
        status: 'rejected',
        submittedAt: '2026-01-12',
        rejectedBy: 'Quản lý',
        rejectedAt: '2026-01-13',
        rejectionReason: 'Đã có quá nhiều nhân viên nghỉ trong thời gian này',
        isDraft: false
    },
    {
        id: 'leave_004',
        startDate: '2026-04-10',
        endDate: '2026-04-12',
        leaveType: 'annual',
        reason: 'Du lịch gia đình',
        status: 'draft',
        isDraft: true
    }
];

const AssistantLeaveRequests = () => {
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'

    const filteredRequests = mockLeaveRequests.filter(req => {
        if (filterStatus === 'all') return true;
        return req.status === filterStatus;
    });

    const getStatusInfo = (status) => {
        switch (status) {
            case 'approved':
                return { label: 'Đã duyệt', variant: 'success', icon: CheckCircle };
            case 'pending':
                return { label: 'Chờ duyệt', variant: 'warning', icon: Clock };
            case 'rejected':
                return { label: 'Từ chối', variant: 'danger', icon: XCircle };
            case 'draft':
                return { label: 'Bản nháp', variant: 'default', icon: Edit };
            default:
                return { label: status, variant: 'default', icon: AlertCircle };
        }
    };

    const getLeaveTypeName = (type) => {
        const types = {
            annual: 'Phép năm',
            sick: 'Nghỉ ốm',
            personal: 'Việc riêng',
            other: 'Khác'
        };
        return types[type] || type;
    };

    const calculateDays = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    const handleCreateClick = () => {
        setSelectedRequest(null);
        setModalMode('create');
        setShowModal(true);
    };

    const handleEditClick = (request) => {
        setSelectedRequest(request);
        setModalMode('edit');
        setShowModal(true);
    };

    const handleDeleteClick = (requestId) => {
        if (confirm('Bạn có chắc muốn xóa bản nháp này?')) {
            // TODO: Call API to delete draft
            console.log('Deleting draft:', requestId);
        }
    };

    const handleSubmitClick = (requestId) => {
        if (confirm('Bạn có chắc muốn gửi yêu cầu nghỉ phép này?')) {
            // TODO: Call API to submit leave request
            console.log('Submitting leave request:', requestId);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedRequest(null);
    };

    const handleSaveRequest = (data, isDraft) => {
        // TODO: Call API to save leave request
        console.log('Saving leave request:', data, 'isDraft:', isDraft);
    };

    const stats = {
        total: mockLeaveRequests.length,
        pending: mockLeaveRequests.filter(r => r.status === 'pending').length,
        approved: mockLeaveRequests.filter(r => r.status === 'approved').length,
        rejected: mockLeaveRequests.filter(r => r.status === 'rejected').length
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Nghỉ Phép</h1>
                    <p className="text-gray-600 mt-1">Quản lý yêu cầu nghỉ phép</p>
                </div>
                <button
                    onClick={handleCreateClick}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 transition-colors"
                >
                    <Plus size={20} />
                    Tạo yêu cầu mới
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Tổng yêu cầu</p>
                            <p className="text-3xl font-bold text-blue-600 mt-1">{stats.total}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <Clock size={24} className="text-blue-600" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Chờ duyệt</p>
                            <p className="text-3xl font-bold text-orange-600 mt-1">{stats.pending}</p>
                        </div>
                        <div className="p-3 bg-orange-100 rounded-full">
                            <AlertCircle size={24} className="text-orange-600" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Đã duyệt</p>
                            <p className="text-3xl font-bold text-green-600 mt-1">{stats.approved}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                            <CheckCircle size={24} className="text-green-600" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Từ chối</p>
                            <p className="text-3xl font-bold text-red-600 mt-1">{stats.rejected}</p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-full">
                            <XCircle size={24} className="text-red-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">Lọc theo trạng thái:</span>
                    <div className="flex gap-2">
                        {['all', 'pending', 'approved', 'rejected', 'draft'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === status
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {status === 'all' && 'Tất cả'}
                                {status === 'pending' && 'Chờ duyệt'}
                                {status === 'approved' && 'Đã duyệt'}
                                {status === 'rejected' && 'Từ chối'}
                                {status === 'draft' && 'Bản nháp'}
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Leave Requests List */}
            <div className="grid grid-cols-1 gap-4">
                {filteredRequests.length > 0 ? (
                    filteredRequests.map((request) => {
                        const statusInfo = getStatusInfo(request.status);
                        const StatusIcon = statusInfo.icon;
                        const days = calculateDays(request.startDate, request.endDate);

                        return (
                            <Card key={request.id} className="hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        {/* Date Badge */}
                                        <div className="bg-primary-100 px-4 py-3 rounded-lg text-center min-w-[100px]">
                                            <div className="text-xs text-primary-600 font-medium">Thời gian</div>
                                            <div className="text-sm font-bold text-primary-700 mt-1">
                                                {days} ngày
                                            </div>
                                        </div>

                                        {/* Request Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {getLeaveTypeName(request.leaveType)}
                                                </h3>
                                                <Badge variant={statusInfo.variant}>
                                                    <StatusIcon size={14} className="inline mr-1" />
                                                    {statusInfo.label}
                                                </Badge>
                                            </div>

                                            <div className="text-sm text-gray-600 space-y-1">
                                                <p>
                                                    <span className="font-medium">Từ:</span> {request.startDate}
                                                    <span className="mx-2">→</span>
                                                    <span className="font-medium">Đến:</span> {request.endDate}
                                                </p>
                                                <p><span className="font-medium">Lý do:</span> {request.reason}</p>

                                                {request.status === 'approved' && (
                                                    <p className="text-green-600">
                                                        ✓ Đã duyệt bởi {request.approvedBy} vào {request.approvedAt}
                                                    </p>
                                                )}

                                                {request.status === 'rejected' && (
                                                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                                                        <p className="text-red-700 text-xs">
                                                            <strong>Lý do từ chối:</strong> {request.rejectionReason}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 ml-4">
                                        {request.isDraft && (
                                            <>
                                                <button
                                                    onClick={() => handleEditClick(request)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(request.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleSubmitClick(request.id)}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Gửi yêu cầu"
                                                >
                                                    <Send size={20} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        );
                    })
                ) : (
                    <Card>
                        <div className="text-center py-12 text-gray-500">
                            <Clock size={48} className="mx-auto text-gray-300 mb-4" />
                            <p>Không có yêu cầu nghỉ phép nào</p>
                        </div>
                    </Card>
                )}
            </div>

            {/* Modal */}
            <LeaveRequestModal
                request={selectedRequest}
                mode={modalMode}
                isOpen={showModal}
                onClose={closeModal}
                onSave={handleSaveRequest}
            />
        </div>
    );
};

export default AssistantLeaveRequests;
