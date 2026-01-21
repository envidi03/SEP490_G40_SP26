import React, { useState, useMemo, useEffect } from 'react';
import { Plus } from 'lucide-react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import LeaveRequestStats from './components/LeaveRequestStats';
import LeaveRequestTable from './components/LeaveRequestTable';
import LeaveRequestForm from './components/LeaveRequestForm';
import { useAuth } from '../../contexts/AuthContext';
import { mockLeaveRequests } from '../../utils/mockData';

const LeaveRequestList = () => {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        if (user) {
            console.log('🔍 LeaveRequestList - User:', user);
            console.log('🔍 User ID:', user.id);
            console.log('📋 All Leave Requests:', mockLeaveRequests);
            const userRequests = mockLeaveRequests.filter(req => req.user_id === user.id);
            console.log('✅ Filtered Leave Requests:', userRequests);
            console.log('📊 Total requests found:', userRequests.length);
            setRequests(userRequests);
        }
    }, [user]);

    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [typeFilter, setTypeFilter] = useState("All");

    // Calculate stats
    const stats = useMemo(() => ({
        totalDays: requests.reduce((acc, curr) => {
            const start = new Date(curr.startDate);
            const end = new Date(curr.endDate);
            const days = (end - start) / (1000 * 60 * 60 * 24) + 1;
            return acc + days;
        }, 0),
        pending: requests.filter(r => r.status === 'PENDING').length,
        approved: requests.filter(r => r.status === 'APPROVED').length,
        rejected: requests.filter(r => r.status === 'REJECTED').length,
    }), [requests]);

    // Filter requests
    const filteredRequests = useMemo(() => {
        return requests.filter(req => {
            const matchesSearch = req.reason.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "All" || req.status === statusFilter;
            const matchesType = typeFilter === "All" || req.type === typeFilter;
            return matchesSearch && matchesStatus && matchesType;
        });
    }, [requests, searchTerm, statusFilter, typeFilter]);

    const handleCreateRequest = (data) => {
        const newRequest = {
            id: `leave_${Date.now()}`,
            user_id: user.id,
            createdAt: new Date().toISOString().split('T')[0],
            status: 'PENDING',
            ...data
        };
        setRequests([newRequest, ...requests]);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Xin nghỉ phép</h1>
                    <p className="text-gray-600 mt-1">Quản lý các yêu cầu nghỉ phép của bạn</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} className="mr-2" />
                    Tạo yêu cầu
                </Button>
            </div>

            {/* Stats */}
            <LeaveRequestStats stats={stats} />

            {/* Search and Filter */}
            <Card>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                            placeholder="Tìm kiếm theo lý do..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            options={[
                                { value: 'All', label: 'Tất cả trạng thái' },
                                { value: 'PENDING', label: 'Chờ duyệt' },
                                { value: 'APPROVED', label: 'Đã duyệt' },
                                { value: 'REJECTED', label: 'Từ chối' }
                            ]}
                        />
                        <Select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            options={[
                                { value: 'All', label: 'Tất cả loại nghỉ' },
                                { value: 'SICK_LEAVE', label: 'Nghỉ ốm' },
                                { value: 'ANNUAL_LEAVE', label: 'Nghỉ phép năm' },
                                { value: 'PERSONAL_LEAVE', label: 'Việc riêng' }
                            ]}
                        />
                    </div>
                    <div className="flex justify-end pt-2">
                        <Button
                            variant="outline"
                            className="bg-transparent"
                            onClick={() => {
                                setSearchTerm("");
                                setStatusFilter("All");
                                setTypeFilter("All");
                            }}
                        >
                            Xóa bộ lọc
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Table */}
            <Card
                title={`Danh sách yêu cầu (${filteredRequests.length})`}
                actions={<Badge variant="info">{filteredRequests.length} yêu cầu</Badge>}
            >
                <LeaveRequestTable requests={filteredRequests} />
            </Card>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Tạo yêu cầu nghỉ phép"
            >
                <LeaveRequestForm
                    onSubmit={handleCreateRequest}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
};

export default LeaveRequestList;
