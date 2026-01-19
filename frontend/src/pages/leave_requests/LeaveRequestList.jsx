import React, { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import LeaveRequestStats from './components/LeaveRequestStats';
import LeaveRequestTable from './components/LeaveRequestTable';
import LeaveRequestForm from './components/LeaveRequestForm';

// Mock data
const MOCK_REQUESTS = [
    {
        id: 1,
        createdAt: '2026-01-10',
        startDate: '2026-01-20',
        endDate: '2026-01-22',
        type: 'vacation',
        reason: 'Đi du lịch cùng gia đình',
        status: 'Approved'
    },
    {
        id: 2,
        createdAt: '2026-01-05',
        startDate: '2026-01-06',
        endDate: '2026-01-06',
        type: 'sick',
        reason: 'Sốt cao',
        status: 'Rejected'
    },
    {
        id: 3,
        createdAt: '2026-01-15',
        startDate: '2026-01-25',
        endDate: '2026-01-25',
        type: 'personal',
        reason: 'Đám cưới bạn thân',
        status: 'Pending'
    }
];

const LeaveRequestList = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [requests, setRequests] = useState(MOCK_REQUESTS);

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
        pending: requests.filter(r => r.status === 'Pending').length,
        approved: requests.filter(r => r.status === 'Approved').length,
        rejected: requests.filter(r => r.status === 'Rejected').length,
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
            id: Date.now(),
            createdAt: new Date().toISOString(),
            status: 'Pending',
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
                                { value: 'Pending', label: 'Chờ duyệt' },
                                { value: 'Approved', label: 'Đã duyệt' },
                                { value: 'Rejected', label: 'Từ chối' }
                            ]}
                        />
                        <Select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            options={[
                                { value: 'All', label: 'Tất cả loại nghỉ' },
                                { value: 'sick', label: 'Nghỉ ốm' },
                                { value: 'vacation', label: 'Nghỉ phép' },
                                { value: 'personal', label: 'Việc riêng' },
                                { value: 'other', label: 'Khác' }
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
