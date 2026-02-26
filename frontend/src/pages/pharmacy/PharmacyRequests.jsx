import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, CheckCircle, Clock, XCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import PharmacyRequestModal from './PharmacyRequestModal';
import { mockUsers } from '../../utils/mockData';

// Mock Stock Requests Data
const mockRequests = [
    {
        id: 'req_001',
        medicineName: 'Vitamin C 1000mg',
        requestedQuantity: 200,
        currentStock: 50,
        minStock: 100,
        requestDate: '2026-01-15',
        status: 'pending',
        requestedBy: 'Nguyễn Văn A',
        priority: 'high'
    },
    {
        id: 'req_002',
        medicineName: 'Cetirizine 10mg',
        requestedQuantity: 100,
        currentStock: 30,
        minStock: 50,
        requestDate: '2026-01-14',
        status: 'approved',
        requestedBy: 'Nguyễn Văn A',
        priority: 'medium'
    },
    {
        id: 'req_003',
        medicineName: 'Paracetamol 500mg',
        requestedQuantity: 500,
        currentStock: 500,
        minStock: 100,
        requestDate: '2026-01-10',
        status: 'completed',
        requestedBy: 'Trần Thị B',
        priority: 'low'
    }
];

const PharmacyRequests = () => {
    const [filterStatus, setFilterStatus] = useState('all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    // Use local state for requests to simulate adding new ones (in real app, use API)
    const [requests, setRequests] = useState(mockRequests);

    const { user } = useAuth();
    const userRole = user?.role?.toUpperCase() || '';

    // Permissions
    const canCreate = ['PHARMACY',].includes(userRole);
    const canApprove = ['ADMIN_CLINIC'].includes(userRole);

    const filteredRequests = requests.filter(req => {
        return filterStatus === 'all' || req.status === filterStatus;
    });

    const getStatusInfo = (status) => {
        switch (status) {
            case 'pending':
                return { variant: 'warning', label: 'Chờ duyệt', icon: Clock };
            case 'approved':
                return { variant: 'primary', label: 'Đã duyệt', icon: CheckCircle };
            case 'completed':
                return { variant: 'success', label: 'Hoàn thành', icon: CheckCircle };
            case 'rejected':
                return { variant: 'danger', label: 'Từ chối', icon: XCircle };
            default:
                return { variant: 'default', label: status, icon: Clock };
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

    const handleCreateRequest = (newRequestData) => {
        const newRequest = {
            id: `req_${Date.now()}`,
            ...newRequestData,
            requestDate: new Date().toISOString().split('T')[0],
            status: 'pending',
            requestedBy: user?.full_name || 'Pharmacy Staff'
        };

        setRequests([newRequest, ...requests]);
    };

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

            {/* Alert */}
            {pendingCount > 0 && (
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
                        <option value="approved">Đã duyệt</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="rejected">Từ chối</option>
                    </select>
                </div>
            </Card>

            {/* Requests List */}
            <div className="grid grid-cols-1 gap-4">
                {filteredRequests.map((request) => {
                    const statusInfo = getStatusInfo(request.status);
                    const StatusIcon = statusInfo.icon;

                    return (
                        <Card key={request.id} className="hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900">{request.medicineName}</h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                                            {request.priority === 'high' ? 'Ưu tiên cao' : request.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-600">Số lượng yêu cầu</p>
                                            <p className="font-semibold text-gray-900">{request.requestedQuantity}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Tồn kho hiện tại</p>
                                            <p className="font-semibold text-gray-900">{request.currentStock}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Người yêu cầu</p>
                                            <p className="font-semibold text-gray-900">{request.requestedBy}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Ngày yêu cầu</p>
                                            <p className="font-semibold text-gray-900">{request.requestDate}</p>
                                        </div>
                                    </div>
                                </div>
                                <Badge variant={statusInfo.variant}>
                                    <StatusIcon size={14} className="inline mr-1" />
                                    {statusInfo.label}
                                </Badge>
                            </div>

                            {request.status === 'pending' && canApprove && (
                                <div className="flex gap-2 pt-4 border-t border-gray-200">
                                    <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                        Phê duyệt
                                    </button>
                                    <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
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
