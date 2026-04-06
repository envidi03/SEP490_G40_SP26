import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle, XCircle, Clock, Users, Filter, RefreshCw } from 'lucide-react';
import staffService from '../../../services/staffService';
import SharedPagination from '../../../components/ui/SharedPagination';
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
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1 });
    const [serverStats, setServerStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
    const [approvingId, setApprovingId] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null); // { id, status }

    const fetchLeaveRequests = async (search = searchTerm, status = statusFilter, page = currentPage) => {
        setLoading(true);
        try {
            const params = { page, limit: 10 };
            if (search) params.search = search;
            if (status !== 'All') params.status = status;

            const res = await staffService.getAllLeaveRequestsAdmin(params);
            const data = res?.data || [];
            
            // Backend now returns GetListSuccess with { data, pagination }
            // Because of our api interceptor (response.data), res here is the WHOLE json
            setRequests(data);
            
            if (res.pagination) {
                setPagination({
                    totalItems: res.pagination.totalItems,
                    totalPages: res.pagination.totalPages
                });
            }
            if (res.statistics) {
                setServerStats(res.statistics);
            }
        } catch (error) {
            console.error(error);
            setToast({ show: true, message: 'Không thể tải danh sách đơn nghỉ phép.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // Reset to page 1 when search or filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    // Combined effect for fetching
    useEffect(() => {
        const isSearchChange = searchTerm !== ''; 
        const timer = setTimeout(() => {
            fetchLeaveRequests(searchTerm, statusFilter, currentPage);
        }, isSearchChange ? 500 : 0);

        return () => clearTimeout(timer);
    }, [searchTerm, statusFilter, currentPage]);

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
            const apiMessage = error?.response?.data?.message || '';
            
            if (apiMessage.includes('Only PENDING requests can be approved or rejected')) {
                setToast({ 
                    show: true, 
                    message: 'Đơn này đã được xử lý hoặc hủy bởi người khác. Danh sách đang được làm mới...', 
                    type: 'error' 
                });
                // Auto refresh to sync UI
                fetchLeaveRequests();
            } else {
                setToast({ 
                    show: true, 
                    message: apiMessage || 'Thao tác thất bại. Vui lòng thử lại.', 
                    type: 'error' 
                });
            }
        } finally {
            setApprovingId(null);
            setConfirmAction(null);
        }
    };

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
                    { label: 'Tổng đơn', value: serverStats.total, color: 'bg-blue-50 border-blue-100 text-blue-700', icon: Users },
                    { label: 'Chờ duyệt', value: serverStats.pending, color: 'bg-yellow-50 border-yellow-100 text-yellow-700', icon: Clock },
                    { label: 'Đã duyệt', value: serverStats.approved, color: 'bg-green-50 border-green-100 text-green-700', icon: CheckCircle },
                    { label: 'Từ chối', value: serverStats.rejected, color: 'bg-red-50 border-red-100 text-red-700', icon: XCircle },
                ].map(({ label, value, color, icon: Icon }) => (
                    <div key={label} className={`${color} border rounded-xl p-4 transition-all hover:shadow-md`}>
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

            {/* Filter & Search */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3">
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

                <div className="relative flex-1 max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Filter className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên nhân viên..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-900">
                        Danh sách đơn ({requests.length})
                    </h2>
                </div>

                {loading ? (
                    <div className="py-16 text-center text-gray-400 text-sm">Đang tải dữ liệu...</div>
                ) : requests.length === 0 ? (
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
                                {requests.map(req => {
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

                {/* Pagination */}
                <SharedPagination
                    currentPage={currentPage}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.totalItems}
                    onPageChange={setCurrentPage}
                    itemLabel="đơn nghỉ phép"
                />
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal
                show={!!confirmAction}
                title={confirmAction?.status === 'APPROVED' ? 'Xác nhận phê duyệt' : 'Xác nhận từ chối'}
                message={confirmAction?.status === 'APPROVED'
                    ? 'Bạn có chắc chắn muốn PHÊ DUYỆT đơn xin nghỉ phép này không?'
                    : 'Bạn có chắc chắn muốn TỪ CHỐI đơn xin nghỉ phép này không?'}
                icon={confirmAction?.status === 'APPROVED' ? CheckCircle : XCircle}
                iconBgClass={confirmAction?.status === 'APPROVED' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}
                confirmBtnClass={confirmAction?.status === 'APPROVED'
                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-green-200 focus:ring-green-300'
                    : 'bg-red-500 text-white hover:bg-red-600 shadow-red-200 focus:ring-red-300'}
                cancelBtnClass="border-gray-200 text-gray-600 hover:bg-gray-50 focus:ring-gray-200"
                confirmText="Xác nhận"
                onClose={() => setConfirmAction(null)}
                onConfirm={executeApprove}
                isLoading={!!approvingId}
            />
        </div>
    );
};

export default AdminLeaveList;
