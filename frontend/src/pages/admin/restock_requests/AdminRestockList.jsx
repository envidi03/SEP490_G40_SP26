import React, { useState, useEffect } from 'react';
import { PackagePlus, CheckCircle, XCircle } from 'lucide-react';
import ConfirmationModal from '../../../components/ui/ConfirmationModal';
import Toast from '../../../components/ui/Toast';

// Components
import RestockStats from './components/RestockStats';
import RestockFilter from './components/RestockFilter';
import RestockTable from './components/RestockTable';

import inventoryService from '../../../services/inventoryService';

const AdminRestockList = () => {
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');

    // UI States
    const [toast, setToast] = useState({ show: false, type: 'success', message: '' });
    const [loading, setLoading] = useState(false);

    // Modal action state (approve or reject)
    const [confirmAction, setConfirmAction] = useState({ show: false, action: null, request: null });

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await inventoryService.getRestockRequests({ page: 1, limit: 100 });
            if (res.success && res.data) {
                setRequests(res.data);
                setFilteredRequests(res.data);
            }
        } catch (error) {
            console.error("Error fetching restock requests:", error);
            setToast({
                show: true,
                type: 'error',
                message: '❌ Không thể tải danh sách yêu cầu nhập thuốc.'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    useEffect(() => {
        let filtered = requests;

        // Status Filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(r => r.status === statusFilter);
        }

        // Priority Filter
        if (priorityFilter !== 'all') {
            filtered = filtered.filter(r => r.priority === priorityFilter);
        }

        // Search Term Filter
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(r =>
                r.medicine_name.toLowerCase().includes(lowerSearch) ||
                r.request_by_name.toLowerCase().includes(lowerSearch)
            );
        }

        setFilteredRequests(filtered);
    }, [searchTerm, statusFilter, priorityFilter, requests]);

    // Handle open confirmation modals
    const handleApproveClick = (req) => {
        setConfirmAction({ show: true, action: 'approve', request: req });
    };

    const handleRejectClick = (req) => {
        setConfirmAction({ show: true, action: 'reject', request: req });
    };

    // Execute actions
    const executeAction = async () => {
        const { action, request } = confirmAction;
        if (!request) return;

        const newStatus = action === 'approve' ? 'accept' : 'reject';

        try {
            // medicine_id is required from the payload for the patch endpoint
            await inventoryService.updateRestockRequestStatus(request.medicine_id || request.medicine?._id || request.medicineId, request._id || request.id, newStatus);

            // Refresh data from server
            await fetchRequests();

            setToast({
                show: true,
                type: 'success',
                message: `✅ Đã ${action === 'approve' ? 'duyệt' : 'từ chối'} yêu cầu nhập thuốc!`
            });
        } catch (error) {
            console.error("Action error:", error);
            setToast({
                show: true,
                type: 'error',
                message: `❌ Có lỗi xảy ra khi xử lý yêu cầu.`
            });
        } finally {
            setConfirmAction({ show: false, action: null, request: null });
        }
    };

    // Calculate Statistics
    const totalRequests = requests.length;
    const pendingRequests = requests.filter(r => r.status === 'pending').length;
    const highPriority = requests.filter(r => r.priority === 'high' && r.status === 'pending').length;
    const completedRequests = requests.filter(r => r.status === 'completed' || r.status === 'accept').length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <PackagePlus className="text-blue-600" size={40} />
                        Yêu cầu Nhập thuốc
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Theo dõi và xét duyệt các yêu cầu bổ sung kho thuốc
                    </p>
                </div>

                <RestockStats
                    totalRequests={totalRequests}
                    pendingRequests={pendingRequests}
                    highPriority={highPriority}
                    completedRequests={completedRequests}
                />

                <RestockFilter
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    priorityFilter={priorityFilter}
                    onPriorityFilterChange={setPriorityFilter}
                />

                <RestockTable
                    requests={filteredRequests}
                    onApprove={handleApproveClick}
                    onReject={handleRejectClick}
                />

                {/* Status counts text */}
                <div className="mt-6 text-center text-sm font-medium text-gray-500">
                    Hiển thị <span className="text-gray-900 font-bold">{filteredRequests.length}</span> / {requests.length} yêu cầu
                </div>
            </div>

            <ConfirmationModal
                show={confirmAction.show}
                onClose={() => setConfirmAction({ show: false, action: null, request: null })}
                onConfirm={executeAction}
                title={confirmAction.action === 'approve' ? 'Duyệt yêu cầu' : 'Từ chối yêu cầu'}
                message={confirmAction.request ?
                    `Bạn có chắc chắn muốn ${confirmAction.action === 'approve' ? 'DUYỆT' : 'TỪ CHỐI'} yêu cầu nhập thêm ${confirmAction.request.quantity_requested} ${confirmAction.request.medicine_name} của nhân viên ${confirmAction.request.request_by_name || 'Không xác định'} không?`
                    : ''}
                icon={confirmAction.action === 'approve' ? CheckCircle : XCircle}
                iconBgClass={confirmAction.action === 'approve' ? 'bg-blue-50 text-blue-500' : 'bg-red-50 text-red-500'}
                confirmBtnClass={confirmAction.action === 'approve' ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200' : 'bg-red-500 text-white hover:bg-red-600 shadow-red-200'}
                cancelBtnClass={confirmAction.action === 'approve' ? 'border-gray-200 text-gray-600 hover:bg-gray-50' : 'border-red-200 text-red-600 hover:bg-red-50'}
                confirmText={confirmAction.action === 'approve' ? 'Duyệt' : 'Từ chối'}
                loadingText={confirmAction.action === 'approve' ? 'Đang duyệt...' : 'Đang từ chối...'}
                isLoading={loading}
            />

            {toast.show && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast({ ...toast, show: false })}
                    duration={3000}
                />
            )}
        </div>
    );
};

export default AdminRestockList;
