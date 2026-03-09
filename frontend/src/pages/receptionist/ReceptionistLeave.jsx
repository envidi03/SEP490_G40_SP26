import { useState } from 'react';
import { Clock, Plus, Edit, Trash2, Send, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { formatDate } from '../../utils/dateUtils';
import LeaveRequestModal from './components/modals/LeaveRequestModal';
import * as leaveRequestService from '../../services/leaveRequestService';
import Toast from '../../components/ui/Toast';
import { Loader2 } from 'lucide-react';

const ReceptionistLeave = () => {
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'

    const fetchLeaveRequests = async () => {
        setLoading(true);
        try {
            const res = await leaveRequestService.getMyLeaveRequests();
            const data = res.data?.data || res.data || [];
            setLeaveRequests(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Lỗi khi tải danh sách nghỉ phép:', error);
            setToast({ show: true, message: 'Không thể tải danh sách nghỉ phép', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useState(() => {
        fetchLeaveRequests();
    }, []);

    const filteredRequests = leaveRequests.filter(req => {
        if (filterStatus === 'all') return true;
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
                return { label: 'Đã hủy', variant: 'danger', icon: XCircle };
            case 'DRAFT':
                return { label: 'Bản nháp', variant: 'default', icon: Edit };
            default:
                return { label: status, variant: 'default', icon: AlertCircle };
        }
    };

    const getLeaveTypeName = (type) => {
        const types = {
            ANNUAL: 'Phép năm',
            SICK: 'Nghỉ ốm',
            PERSONAL_LEAVE: 'Việc riêng',
            MATERNITY: 'Thai sản',
            BEREAVEMENT: 'Tang chế',
            EMERGENCY: 'Khẩn cấp',
            UNPAID: 'Nghỉ không lương'
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

    const handleDeleteClick = async (requestId) => {
        if (window.confirm('Bạn có chắc muốn hủy yêu cầu nghỉ phép này?')) {
            try {
                await leaveRequestService.cancelLeaveRequest(requestId);
                setToast({ show: true, message: 'Hủy yêu cầu thành công', type: 'success' });
                fetchLeaveRequests();
            } catch (error) {
                console.error('Lỗi khi hủy đơn:', error);
                setToast({ show: true, message: error.response?.data?.message || 'Không thể hủy đơn', type: 'error' });
            }
        }
    };

    const handleSubmitClick = (requestId) => {
        // In this implementation, submission is done during creation/edit
        // But if there's a specific 'SUBMIT' status logic needed later, we can add it.
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedRequest(null);
    };

    const handleSaveRequest = async (data, isDraft) => {
        // isDraft is unused for now as backend seems to default to PENDING
        try {
            if (modalMode === 'create') {
                await leaveRequestService.createLeaveRequest(data);
                setToast({ show: true, message: 'Gửi yêu cầu thành công!', type: 'success' });
            } else {
                await leaveRequestService.updateLeaveRequest(selectedRequest._id, data);
                setToast({ show: true, message: 'Cập nhật thành công!', type: 'success' });
            }
            fetchLeaveRequests();
            setShowModal(false);
        } catch (error) {
            console.error('Lỗi khi lưu đơn:', error);
            setToast({ show: true, message: error.response?.data?.message || 'Không thể lưu đơn', type: 'error' });
        }
    };

    const stats = {
        total: leaveRequests.length,
        pending: leaveRequests.filter(r => r.status === 'PENDING').length,
        approved: leaveRequests.filter(r => r.status === 'APPROVED').length,
        rejected: leaveRequests.filter(r => r.status === 'REJECTED').length
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Nghỉ Phép</h1>
                    <p className="text-gray-600 mt-1">Quản lý yêu cầu nghỉ phép của bạn</p>
                </div>
                <button
                    onClick={handleCreateClick}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 transition-colors shadow-sm"
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
            <div className="grid grid-cols-1 gap-4 min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 italic text-gray-400">
                        <Loader2 className="animate-spin mb-2" size={32} />
                        Đang tải danh sách...
                    </div>
                ) : filteredRequests.length > 0 ? (
                    filteredRequests.map((request) => {
                        const statusInfo = getStatusInfo(request.status);
                        const StatusIcon = statusInfo.icon;
                        const days = calculateDays(request.startedDate, request.endDate);

                        return (
                            <Card key={request.id} className="hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        {/* Date Badge */}
                                        <div className="bg-primary-50 px-4 py-3 rounded-xl border border-primary-100 text-center min-w-[100px]">
                                            <div className="text-xs text-primary-600 font-medium uppercase tracking-wider">Thời gian</div>
                                            <div className="text-lg font-bold text-primary-700 mt-1">
                                                {days} ngày
                                            </div>
                                        </div>

                                        {/* Request Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-bold text-gray-900">
                                                    {getLeaveTypeName(request.type)}
                                                </h3>
                                                <Badge variant={statusInfo.variant} className="ml-2">
                                                    <StatusIcon size={14} className="inline mr-1" />
                                                    {statusInfo.label}
                                                </Badge>
                                            </div>

                                            <div className="text-sm text-gray-700 space-y-1.5">
                                                <p className="flex items-center gap-2">
                                                    <span className="font-semibold text-gray-500 w-16">Từ:</span>
                                                    <span className="font-medium bg-gray-100 px-2 py-0.5 rounded">{formatDate(request.startedDate)}</span>
                                                    <span className="text-gray-400">→</span>
                                                    <span className="font-semibold text-gray-500 w-10">Đến:</span>
                                                    <span className="font-medium bg-gray-100 px-2 py-0.5 rounded">{formatDate(request.endDate)}</span>
                                                </p>
                                                <p className="flex items-start gap-2 pt-1">
                                                    <span className="font-semibold text-gray-500 w-16">Lý do:</span>
                                                    <span className="flex-1 italic">{request.reason}</span>
                                                </p>

                                                {request.status === 'APPROVED' && (
                                                    <p className="text-green-600 bg-green-50 px-3 py-2 rounded-lg mt-3 text-xs inline-flex items-center gap-1 border border-green-100">
                                                        <CheckCircle size={14} />
                                                        Đã duyệt vào {formatDate(request.updatedAt)}
                                                    </p>
                                                )}

                                                {request.status === 'REJECTED' && (
                                                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                        <p className="text-red-700 text-sm flex items-start gap-2">
                                                            <XCircle size={16} className="mt-0.5 flex-shrink-0" />
                                                            <span><strong>Lý do từ chối:</strong> {request.rejectionReason || 'Không có lý do cụ thể'}</span>
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 ml-4">
                                        {request.status === 'PENDING' && (
                                            <>
                                                <button
                                                    onClick={() => handleEditClick(request)}
                                                    className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-transparent hover:border-blue-100"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(request._id)}
                                                    className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
                                                    title="Hủy yêu cầu"
                                                >
                                                    <Trash2 size={20} />
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
                        <div className="text-center py-16 text-gray-500">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                <Clock size={32} className="text-gray-400" />
                            </div>
                            <p className="text-lg font-medium text-gray-700">Không có yêu cầu nghỉ phép nào</p>
                            <p className="text-sm text-gray-400 mt-1">Các yêu cầu nghỉ phép của bạn sẽ hiển thị tại đây.</p>
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

            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ ...toast, show: false })}
            />
        </div>
    );
};

export default ReceptionistLeave;
