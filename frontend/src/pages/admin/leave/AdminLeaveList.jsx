import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle, XCircle, Clock, Users, Filter, RefreshCw } from 'lucide-react';
import staffService from '../../../services/staffService';
import Toast from '../../../components/ui/Toast';
import ConfirmationModal from '../../../components/ui/ConfirmationModal';

const STATUS_CONFIG = {
    PENDING: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800 border border-yellow-200', icon: Clock },
    APPROVED: { label: 'Đã duyệt', color: 'bg-green-100 text-green-800 border border-green-200', icon: CheckCircle },
    REJECTED: { label: 'Từ chối', color: 'bg-red-100 text-red-800 border border-red-200', icon: XCircle },
    CANCELLED: { label: 'Đã hủy', color: 'bg-gray-100 text-gray-600 border border-gray-200', icon: XCircle },
};

const TYPE_LABELS = {
    SICK: 'Nghỉ ốm',
    ANNUAL: 'Nghỉ phép năm',
    MATERNITY: 'Thai sản',
    UNPAID: 'Không lương',
    BEREAVEMENT: 'Tang chế',
    EMERGENCY: 'Khẩn cấp',
};

const ROLE_LABELS = {
    DOCTOR: 'Bác sĩ',
    RECEPTIONIST: 'Lễ tân',
    PHARMACY: 'Dược sĩ',
    PHARMACIST: 'Dược sĩ',
    ASSISTANT: 'Trợ lý',
    ADMIN_CLINIC: 'Quản trị viên',
};

const AdminLeaveList = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [statusFilter, setStatusFilter] = useState('All');
    const [approvingId, setApprovingId] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null); // { id, status }

    const fetchLeaveRequests = async () => {
        setLoading(true);
        try {
            const res = await staffService.getAllLeaveRequestsAdmin();
            const data = res?.data?.data || res?.data || [];
            setRequests(data);
        } catch (error) {
            console.error(error);
            setToast({ show: true, message: 'Không thể tải danh sách đơn nghỉ phép.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaveRequests();
    }, []);

    const handleApprove = (leaveId, status) => {
        setConfirmAction({ id: leaveId, status });
    };

    const executeApprove = async () => {
        if (!confirmAction) return;
        const { id: leaveId, status } = confirmAction;

        setApprovingId(leaveId);
        try {
            await staffService.approveLeaveRequest(leaveId, status);
            setToast({
                show: true,
                message: status === 'APPROVED' ? 'Đã phê duyệt đơn nghỉ phép!' : 'Đã từ chối đơn nghỉ phép.',
                type: status === 'APPROVED' ? 'success' : 'warning'
            });
            fetchLeaveRequests();
        } catch (error) {
            setToast({ show: true, message: error?.response?.data?.message || 'Thao tác thất bại.', type: 'error' });
        } finally {
            setApprovingId(null);
            setConfirmAction(null);
        }
    };

    const filteredRequests = useMemo(() => {
        if (statusFilter === 'All') return requests;
        return requests.filter(r => r.status === statusFilter);
    }, [requests, statusFilter]);

    const stats = useMemo(() => ({
        total: requests.length,
        pending: requests.filter(r => r.status === 'PENDING').length,
        approved: requests.filter(r => r.status === 'APPROVED').length,
        rejected: requests.filter(r => r.status === 'REJECTED').length,
    }), [requests]);

    const getStaffName = (req) => {
        return req.staff_id?.profile_id?.full_name
            || req.staff_id?.account_id?.username
            || '—';
    };

    const getStaffRole = (req) => {
        const roleName = req.staff_id?.account_id?.role_id?.name;
        return ROLE_LABELS[roleName] || roleName || '—';
    };

    return (
        <div className="space-y-6">
            {toast.show && (
                <Toast
                    show={toast.show}
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Nghỉ phép</h1>
                    <p className="text-gray-500 text-sm mt-1">Phê duyệt hoặc từ chối các đơn xin nghỉ phép của nhân viên</p>
                </div>
                <button
                    onClick={fetchLeaveRequests}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <RefreshCw size={16} />
                    Làm mới
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Tổng đơn', value: stats.total, color: 'bg-blue-50 border-blue-100 text-blue-700', icon: Users },
                    { label: 'Chờ duyệt', value: stats.pending, color: 'bg-yellow-50 border-yellow-100 text-yellow-700', icon: Clock },
                    { label: 'Đã duyệt', value: stats.approved, color: 'bg-green-50 border-green-100 text-green-700', icon: CheckCircle },
                    { label: 'Từ chối', value: stats.rejected, color: 'bg-red-50 border-red-100 text-red-700', icon: XCircle },
                ].map(({ label, value, color, icon: Icon }) => (
                    <div key={label} className={`${color} border rounded-xl p-4`}>
                        <div className="flex items-center gap-3">
                            <Icon size={20} />
                            <div>
                                <p className="text-xs font-medium opacity-75">{label}</p>
                                <p className="text-2xl font-bold">{value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                <Filter size={16} className="text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-600 font-medium">Lọc theo trạng thái:</span>
                <div className="flex gap-2 flex-wrap">
                    {['All', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${statusFilter === s
                                ? 'bg-primary-600 text-white border-primary-600'
                                : 'bg-white text-gray-600 border-gray-300 hover:border-primary-400 hover:text-primary-600'
                                }`}
                        >
                            {s === 'All' ? 'Tất cả' : STATUS_CONFIG[s]?.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-900">
                        Danh sách đơn ({filteredRequests.length})
                    </h2>
                </div>

                {loading ? (
                    <div className="py-16 text-center text-gray-400 text-sm">Đang tải dữ liệu...</div>
                ) : filteredRequests.length === 0 ? (
                    <div className="py-16 text-center text-gray-400 text-sm">Không có đơn nào</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                                <tr>
                                    <th className="px-6 py-3 text-left">Nhân viên</th>
                                    <th className="px-6 py-3 text-left">Loại nghỉ</th>
                                    <th className="px-6 py-3 text-left">Từ ngày</th>
                                    <th className="px-6 py-3 text-left">Đến ngày</th>
                                    <th className="px-6 py-3 text-left">Lý do</th>
                                    <th className="px-6 py-3 text-left">Trạng thái</th>
                                    <th className="px-6 py-3 text-left">Ngày gửi</th>
                                    <th className="px-6 py-3 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredRequests.map(req => {
                                    const StatusIcon = STATUS_CONFIG[req.status]?.icon || Clock;
                                    const isPending = req.status === 'PENDING';
                                    const isActioning = approvingId === req._id;

                                    return (
                                        <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">{getStaffName(req)}</p>
                                                    <p className="text-xs text-gray-400">{getStaffRole(req)}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {TYPE_LABELS[req.type] || req.type}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                                                {req.startedDate ? new Date(req.startedDate).toLocaleDateString('vi-VN') : '—'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                                                {req.endDate ? new Date(req.endDate).toLocaleDateString('vi-VN') : '—'}
                                            </td>
                                            <td className="px-6 py-4 max-w-xs">
                                                <p className="truncate text-gray-600">{req.reason || '—'}</p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[req.status]?.color}`}>
                                                    <StatusIcon size={12} />
                                                    {STATUS_CONFIG[req.status]?.label || req.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 whitespace-nowrap text-xs">
                                                {req.createdAt ? new Date(req.createdAt).toLocaleDateString('vi-VN') : '—'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {isPending ? (
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleApprove(req._id, 'APPROVED')}
                                                            disabled={isActioning}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            <CheckCircle size={14} />
                                                            Duyệt
                                                        </button>
                                                        <button
                                                            onClick={() => handleApprove(req._id, 'REJECTED')}
                                                            disabled={isActioning}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 text-xs font-medium rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                        >
                                                            <XCircle size={14} />
                                                            Từ chối
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">Đã xử lý</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal
                show={!!confirmAction}
                title={confirmAction?.status === 'APPROVED' ? 'Xác nhận phê duyệt' : 'Xác nhận từ chối'}
                message={confirmAction?.status === 'APPROVED'
                    ? 'Bạn có chắc chắn muốn PHÊ DUYỆT đơn xin nghỉ phép này không?'
                    : 'Bạn có chắc chắn muốn TỪ CHỐI đơn xin nghỉ phép này không?'}
                onClose={() => setConfirmAction(null)}
                onConfirm={executeApprove}
                isLoading={!!approvingId}
            />
        </div>
    );
};

export default AdminLeaveList;
