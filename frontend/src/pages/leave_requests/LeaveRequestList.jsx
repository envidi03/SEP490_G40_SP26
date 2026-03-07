import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getMyLeaveRequests, createLeaveRequest } from '../../services/leaveRequestService';

import LeaveRequestStats from './components/LeaveRequestStats';
import LeaveRequestTable from './components/LeaveRequestTable';
import LeaveRequestForm from './components/LeaveRequestForm';
import Modal from '../../components/ui/Modal';
import Toast from '../../components/ui/Toast';

const LeaveRequestList = () => {
    const { user } = useAuth();

    // States
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

    // Lọc theo tabs/status tương tự như Approval
    const [statusFilter, setStatusFilter] = useState('All');

    const showToast = (type, message) => setToast({ show: true, type, message });
    const closeToast = () => setToast(prev => ({ ...prev, show: false }));

    const fetchRequests = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Có thể truyền params filter lên backend nếu API hỗ trợ,
            // hoặc fetch toàn bộ rồi tính stats trên frontend.
            // Giả định backend trả về `{ data: [...] }`
            const res = await getMyLeaveRequests({ limit: 100 });
            setRequests(res.data || []);
        } catch (err) {
            console.error('Lỗi khi tải danh sách nghỉ phép:', err);
            setError('Không thể tải dữ liệu nghỉ phép. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchRequests();
        }
    }, [user]);

    // Handle Create
    const handleCreateRequest = async (formData) => {
        setIsSubmitting(true);
        try {
            await createLeaveRequest({
                ...formData,
                user_id: user.id
            });
            showToast('success', 'Đã gửi yêu cầu nghỉ phép thành công!');
            setIsModalOpen(false);
            fetchRequests(); // reload list
        } catch (err) {
            console.error('Lỗi khi tạo yêu cầu nghỉ phép:', err);
            showToast('error', err.response?.data?.message || 'Không thể tạo yêu cầu. Vui lòng kiểm tra lại!');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Derived states cho Stats & Filter
    const stats = useMemo(() => {
        let pending = 0;
        let approved = 0;
        let rejected = 0;
        let totalDays = 0;

        requests.forEach(req => {
            if (req.status === 'PENDING') pending++;
            else if (req.status === 'APPROVED') approved++;
            else if (req.status === 'REJECTED') rejected++;

            // Tính số ngày
            if (req.startDate && req.endDate) {
                const s = new Date(req.startDate);
                const e = new Date(req.endDate);
                if (!isNaN(s) && !isNaN(e)) {
                    const days = (e - s) / (1000 * 60 * 60 * 24) + 1;
                    if (days > 0) totalDays += days;
                }
            }
        });

        return { totalDays, pending, approved, rejected };
    }, [requests]);

    const filteredRequests = useMemo(() => {
        if (statusFilter === 'All') return requests;
        return requests.filter(r => r.status === statusFilter);
    }, [requests, statusFilter]);

    return (
        <div className="space-y-6">
            <Toast
                show={toast.show}
                type={toast.type}
                message={toast.message}
                onClose={closeToast}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Xin Nghỉ Phép</h1>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Quản lý và theo dõi các yêu cầu nghỉ phép của chuyên viên/bác sĩ
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-teal-500 hover:bg-teal-600 text-white text-[13px] font-medium px-4 py-2 rounded-xl transition-all shadow-sm shadow-teal-500/30 whitespace-nowrap"
                >
                    + Tạo đơn xin phép
                </button>
            </div>

            {/* Stats / Filters */}
            <LeaveRequestStats
                stats={stats}
                activeFilter={statusFilter}
                onFilterChange={setStatusFilter}
            />

            {/* Info Message */}
            <div className="flex items-center gap-2 mb-2">
                <h2 className="text-sm font-semibold text-gray-700">
                    Danh sách hiển thị <span className="text-teal-600 font-bold">{filteredRequests.length}</span> đơn
                </h2>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-[13px]">
                    {error}
                </div>
            )}

            {/* Content Table */}
            {isLoading ? (
                <div className="space-y-3 animate-pulse">
                    <div className="h-10 bg-gray-100 rounded-xl" />
                    <div className="h-16 bg-gray-50 rounded-xl" />
                    <div className="h-16 bg-gray-50 rounded-xl" />
                </div>
            ) : (
                <LeaveRequestTable requests={filteredRequests} />
            )}

            {/* Modal Create Form */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-base font-bold text-gray-800 tracking-tight">Tạo Đơn Xin Nghỉ Phép</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6">
                            <LeaveRequestForm
                                onSubmit={handleCreateRequest}
                                onCancel={() => setIsModalOpen(false)}
                                isSubmitting={isSubmitting}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeaveRequestList;
