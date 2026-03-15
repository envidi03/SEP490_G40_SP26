import { useState, useEffect } from 'react';
import { Clock, Plus, Edit, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import LeaveRequestModal from './modals/LeaveRequestModal';
import staffService from '../../services/staffService';
import toast from 'react-hot-toast';

const AssistantLeaveRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');

    const fetchLeaveRequests = async () => {
        try {
            setLoading(true);
            const response = await staffService.getLeaveRequests();
            // Data usually mapped out in interceptor or we check response.data
            const leaveData = response.data?.data || response.data || [];
            // Sort by latest created
            leaveData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setRequests(leaveData);
        } catch (error) {
            console.error('Error fetching leave requests:', error);
            toast.error('Không thể tải danh sách nghỉ phép');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaveRequests();
    }, []);

    const filteredRequests = requests.filter(req => {
        if (filterStatus === 'all') return true;
        // Backend returns uppercase status
        return req.status === filterStatus.toUpperCase();
    });

    const getStatusInfo = (status) => {
        switch (status) {
            case 'APPROVED':
                return { label: 'Đã duyệt', variant: 'success', icon: CheckCircle };
            case 'PENDING':
                return { label: 'Chờ duyệt', variant: 'warning', icon: Clock };
            case 'REJECTED':
                return { label: 'Từ chối', variant: 'danger', icon: XCircle };
            case 'CANCELLED':
                return { label: 'Đã hủy', variant: 'secondary', icon: Trash2 };
            default:
                return { label: status, variant: 'default', icon: AlertCircle };
        }
    };

    const getLeaveTypeName = (type) => {
        const types = {
            ANNUAL: 'Phép năm',
            SICK: 'Nghỉ ốm',
            MATERNITY: 'Thai sản',
            UNPAID: 'Không lương',
            BEREAVEMENT: 'Tang chế',
            EMERGENCY: 'Khẩn cấp'
        };
        return types[type] || type;
    };

    const calculateDays = (startDate, endDate) => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
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

    const handleCancelClick = async (requestId) => {
        if (confirm('Bạn có chắc muốn hủy yêu cầu nghỉ phép này?')) {
            try {
                await staffService.cancelLeaveRequest(requestId);
                toast.success('Hủy đơn nghỉ phép thành công');
                fetchLeaveRequests();
            } catch (error) {
                console.error('Error cancelling leave request:', error);
                toast.error(error.response?.data?.message || 'Không thể hủy đơn nghỉ phép');
            }
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedRequest(null);
    };

    const handleSaveRequest = async (formData) => {
        try {
            if (modalMode === 'create') {
                await staffService.createLeaveRequest(formData);
                toast.success('Tạo đơn nghỉ phép thành công');
            } else if (modalMode === 'edit' && selectedRequest?._id) {
                await staffService.updateLeaveRequest(selectedRequest._id, formData);
                toast.success('Cập nhật đơn nghỉ phép thành công');
            }
            closeModal();
            fetchLeaveRequests();
        } catch (error) {
            console.error('Error saving leave request:', error);
            toast.error(error.response?.data?.message || 'Không thể lưu yêu cầu nghỉ phép');
        }
    };

    const stats = {
        total: requests.length,
        pending: requests.filter(r => r.status === 'PENDING').length,
        approved: requests.filter(r => r.status === 'APPROVED').length,
        rejected: requests.filter(r => r.status === 'REJECTED').length
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Nghỉ Phép</h1>
                    <p className="text-gray-600 mt-1">Quản lý yêu cầu nghỉ phép cá nhân</p>
                </div>
                <button
                    onClick={handleCreateClick}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors shadow-sm"
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
                            <p className="text-sm font-medium text-gray-600">Tổng yêu cầu</p>
                            <p className="text-3xl font-bold text-blue-600 mt-1">{loading ? '-' : stats.total}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <Clock size={24} className="text-blue-600" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Chờ duyệt</p>
                            <p className="text-3xl font-bold text-amber-600 mt-1">{loading ? '-' : stats.pending}</p>
                        </div>
                        <div className="p-3 bg-amber-100 rounded-full">
                            <AlertCircle size={24} className="text-amber-600" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Đã duyệt</p>
                            <p className="text-3xl font-bold text-green-600 mt-1">{loading ? '-' : stats.approved}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                            <CheckCircle size={24} className="text-green-600" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Từ chối</p>
                            <p className="text-3xl font-bold text-red-600 mt-1">{loading ? '-' : stats.rejected}</p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-full">
                            <XCircle size={24} className="text-red-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-gray-700">Lọc theo trạng thái:</span>
                    <div className="flex gap-2">
                        {[
                            { value: 'all', label: 'Tất cả' },
                            { value: 'PENDING', label: 'Chờ duyệt' },
                            { value: 'APPROVED', label: 'Đã duyệt' },
                            { value: 'REJECTED', label: 'Từ chối' },
                            { value: 'CANCELLED', label: 'Đã hủy' }
                        ].map(status => (
                            <button
                                key={status.value}
                                onClick={() => setFilterStatus(status.value)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === status.value
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {status.label}
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Leave Requests List */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <Card>
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    </Card>
                ) : filteredRequests.length > 0 ? (
                    filteredRequests.map((request) => {
                        const statusInfo = getStatusInfo(request.status);
                        const StatusIcon = statusInfo.icon;
                        const days = calculateDays(request.startedDate, request.endDate);
                        const isPending = request.status === 'PENDING';

                        return (
                            <Card key={request._id} className="hover:shadow-lg transition-shadow border border-gray-100">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-5 flex-1">
                                        {/* Date Badge */}
                                        <div className="bg-blue-50 border border-blue-100 px-4 py-3 rounded-xl text-center min-w-[110px] shadow-sm">
                                            <div className="text-xs text-blue-600 font-semibold uppercase tracking-wider">Thời gian</div>
                                            <div className="text-xl font-bold text-blue-800 mt-1">
                                                {days} ngày
                                            </div>
                                        </div>

                                        {/* Request Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-bold text-gray-900">
                                                    {getLeaveTypeName(request.type)}
                                                </h3>
                                                <Badge variant={statusInfo.variant}>
                                                    <StatusIcon size={14} className="inline mr-1" />
                                                    {statusInfo.label}
                                                </Badge>
                                            </div>

                                            <div className="text-sm text-gray-600 space-y-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-gray-700">Từ:</span>
                                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-800">{formatDate(request.startedDate)}</span>
                                                    <span className="text-gray-400">→</span>
                                                    <span className="font-semibold text-gray-700">Đến:</span>
                                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-800">{formatDate(request.endDate)}</span>
                                                </div>
                                                <p><span className="font-semibold text-gray-700">Lý do:</span> {request.reason}</p>
                                                <p className="text-xs text-gray-400 mt-2">Đệ trình vào: {formatDate(request.createdAt)}</p>

                                                {request.status === 'APPROVED' && (
                                                    <div className="mt-2 text-green-700 text-sm flex items-center gap-1 font-medium bg-green-50 w-fit px-3 py-1 rounded-lg">
                                                        <CheckCircle size={14} />
                                                        Đơn phép đã được quản lý duyệt
                                                    </div>
                                                )}

                                                {request.status === 'REJECTED' && (
                                                    <div className="mt-2 text-red-700 text-sm flex items-center gap-1 font-medium bg-red-50 w-fit px-3 py-1 rounded-lg">
                                                        <XCircle size={14} />
                                                        Đơn phép đã bị từ chối
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions - Only allow edit/cancel if status is pending */}
                                    {isPending && (
                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() => handleEditClick(request)}
                                                className="p-2 text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 rounded-lg transition-colors shadow-sm"
                                                title="Chỉnh sửa"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleCancelClick(request._id)}
                                                className="p-2 text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 rounded-lg transition-colors shadow-sm"
                                                title="Hủy đơn"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        );
                    })
                ) : (
                    <Card>
                        <div className="text-center py-16 text-gray-500">
                            <Clock size={56} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-lg font-medium text-gray-600">Chưa có yêu cầu nghỉ phép nào</p>
                            <p className="text-sm text-gray-400 mt-1">Bấm nút "Tạo yêu cầu mới" ở góc trên để tạo mới</p>
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
