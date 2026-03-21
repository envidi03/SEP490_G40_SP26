import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import PharmacyRequestModal from './PharmacyRequestModal';
import inventoryService from '../../services/inventoryService';

const PharmacyRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [alertMsg, setAlertMsg] = useState(null); // { type, text }

    const { user } = useAuth();
    const userRole = user?.role?.toUpperCase() || '';

    const canCreate = ['PHARMACY'].includes(userRole);
    const canApprove = ['ADMIN_CLINIC'].includes(userRole);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const params = filterStatus !== 'all' ? { status: filterStatus } : {};
            const res = await inventoryService.getRestockRequests(params);
            if (res?.success) setRequests(res.data || []);
        } catch {
            setAlertMsg({ type: 'error', text: 'Không thể tải danh sách yêu cầu.' });
        } finally {
            setLoading(false);
        }
    }, [filterStatus]);

    useEffect(() => { fetchRequests(); }, [fetchRequests]);

    const handleCreateRequest = async ({ medicineId, requestedQuantity, priority, reason, note }) => {
        try {
            const res = await inventoryService.createRestockRequest(medicineId, {
                request_by: user?._id || user?.id,
                quantity_requested: Number(requestedQuantity),
                priority,
                reason,
                note
            });
            if (res?.success) {
                setAlertMsg({ type: 'success', text: 'Tạo yêu cầu bổ sung thành công!' });
                fetchRequests();
            }
        } catch (err) {
            setAlertMsg({ type: 'error', text: err?.response?.data?.message || 'Tạo yêu cầu thất bại.' });
        }
    };

    const handleUpdateStatus = async (request, newStatus) => {
        const label = newStatus === 'accept' ? 'phê duyệt' : 'từ chối';
        if (!window.confirm(`Xác nhận ${label} yêu cầu này?`)) return;
        setActionLoadingId(request._id);
        try {
            const res = await inventoryService.updateRestockRequestStatus(
                request.medicine_id, request._id, newStatus
            );
            if (res?.success) {
                setAlertMsg({ type: 'success', text: `Đã ${label} yêu cầu thành công!` });
                fetchRequests();
            }
        } catch (err) {
            setAlertMsg({ type: 'error', text: err?.response?.data?.message || `Thao tác thất bại.` });
        } finally {
            setActionLoadingId(null);
        }
    };

    const filteredRequests = requests;

    const getStatusInfo = (status) => {
        switch (status) {
            case 'pending': return { variant: 'warning', label: 'Chờ duyệt', icon: Clock };
            case 'accept': return { variant: 'primary', label: 'Đã duyệt', icon: CheckCircle };
            case 'completed': return { variant: 'success', label: 'Hoàn thành', icon: CheckCircle };
            case 'reject': return { variant: 'danger', label: 'Từ chối', icon: XCircle };
            default: return { variant: 'default', label: status, icon: Clock };
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-red-600 bg-red-50';
            case 'medium': return 'text-yellow-600 bg-yellow-50';
            case 'low': return 'text-green-600 bg-green-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';

    const pendingCount = requests.filter(r => r.status === 'pending').length;

    return (
        <div>
            {/* Header */}
            <div className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Yêu Cầu Bổ Sung Thuốc</h1>
                    <p className="text-gray-600 mt-1">Quản lý yêu cầu nhập thêm thuốc</p>
                </div>
                {canCreate && (
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Tạo yêu cầu mới
                    </button>
                )}
            </div>

            {/* Alert message */}
            {alertMsg && (
                <div className={`mb-4 p-4 rounded-lg border flex items-center justify-between ${alertMsg.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
                    }`}>
                    <span className="text-sm">{alertMsg.text}</span>
                    <button onClick={() => setAlertMsg(null)} className="text-lg leading-none opacity-60 hover:opacity-100">×</button>
                </div>
            )}

            {/* Pending alert */}
            {!loading && pendingCount > 0 && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                        <span className="font-medium">{pendingCount} yêu cầu</span> đang chờ phê duyệt
                    </p>
                </div>
            )}

            {/* Filter */}
            <Card className="mb-6">
                <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700">Trạng thái:</label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="all">Tất cả</option>
                        <option value="pending">Chờ duyệt</option>
                        <option value="accept">Đã duyệt</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="reject">Từ chối</option>
                    </select>
                </div>
            </Card>

            {/* Requests List */}
            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 size={32} className="animate-spin text-primary-600" />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredRequests.map((request) => {
                        const statusInfo = getStatusInfo(request.status);
                        const StatusIcon = statusInfo.icon;
                        const isActioning = actionLoadingId === request._id;

                        return (
                            <Card key={request._id} className="hover:shadow-lg transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">{request.medicine_name}</h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                                                {request.priority === 'high' ? 'Ưu tiên cao' : request.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-600">Số lượng yêu cầu</p>
                                                <p className="font-semibold text-gray-900">{request.quantity_requested} {request.selling_unit || 'đơn vị'}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Tồn kho hiện tại</p>
                                                <p className="font-semibold text-gray-900">{request.current_quantity ?? '—'} {request.selling_unit || ''}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Người yêu cầu</p>
                                                <p className="font-semibold text-gray-900">{request.request_by_name || '—'}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Ngày yêu cầu</p>
                                                <p className="font-semibold text-gray-900">{formatDate(request.created_at)}</p>
                                            </div>
                                        </div>
                                        {request.reason && (
                                            <p className="text-sm text-gray-500 mt-2">📋 {request.reason}</p>
                                        )}
                                    </div>
                                    <Badge variant={statusInfo.variant}>
                                        <StatusIcon size={14} className="inline mr-1" />
                                        {statusInfo.label}
                                    </Badge>
                                </div>

                                {request.status === 'pending' && canApprove && (
                                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                                        <button
                                            onClick={() => handleUpdateStatus(request, 'accept')}
                                            disabled={isActioning}
                                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 flex items-center justify-center gap-2"
                                        >
                                            {isActioning && <Loader2 size={15} className="animate-spin" />}
                                            Phê duyệt
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(request, 'reject')}
                                            disabled={isActioning}
                                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-60"
                                        >
                                            Từ chối
                                        </button>
                                    </div>
                                )}
                            </Card>
                        );
                    })}

                    {filteredRequests.length === 0 && (
                        <Card>
                            <div className="text-center py-12 text-gray-500">
                                Không có yêu cầu nào
                            </div>
                        </Card>
                    )}
                </div>
            )}

            {/* Create Request Modal */}
            <PharmacyRequestModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateRequest}
            />
        </div>
    );
};

export default PharmacyRequests;
