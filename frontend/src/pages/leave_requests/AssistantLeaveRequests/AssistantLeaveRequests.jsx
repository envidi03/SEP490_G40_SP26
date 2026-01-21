import React, { useState, useEffect, useMemo } from 'react';
import { UserCog } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import AssistantLeaveRequestTable from './components/AssistantLeaveRequestTable';
import AssistantLeaveRequestDetail from './components/AssistantLeaveRequestDetail';
import { getAssistantLeaveRequests } from '../../../utils/mockData';

const AssistantLeaveRequests = () => {
    const [requests, setRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    useEffect(() => {
        // Simulate API call
        const timer = setTimeout(() => {
            const data = getAssistantLeaveRequests();
            setRequests(data);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Filter requests
    const filteredRequests = useMemo(() => {
        return requests.filter(req => {
            const matchesSearch =
                req.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.reason.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "All" || req.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [requests, searchTerm, statusFilter]);

    const handleViewRequest = (request) => {
        setSelectedRequest(request);
        setIsDetailModalOpen(true);
    };

    const handleApprove = (request) => {
        // In a real app, this would be an API call
        const updatedRequests = requests.map(r =>
            r.id === request.id
                ? { ...r, status: 'APPROVED', approvedAt: new Date().toISOString() }
                : r
        );
        setRequests(updatedRequests);

        if (selectedRequest && selectedRequest.id === request.id) {
            setIsDetailModalOpen(false);
            setSelectedRequest(null);
        }

        // Show success message (could use a toast here)
        alert(`Đã phê duyệt yêu cầu nghỉ phép của ${request.userName}`);
    };

    const handleReject = (request, reason = '') => {
        // In a real app, this would be an API call
        const updatedRequests = requests.map(r =>
            r.id === request.id
                ? { ...r, status: 'REJECTED', rejectionReason: reason }
                : r
        );
        setRequests(updatedRequests);

        if (selectedRequest && selectedRequest.id === request.id) {
            setIsDetailModalOpen(false);
            setSelectedRequest(null);
        }

        // Show success message
        alert(`Đã từ chối yêu cầu nghỉ phép của ${request.userName}`);
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <UserCog className="mr-3 text-primary-600" size={32} />
                        Quản lý nghỉ phép trợ lý
                    </h1>
                    <p className="text-gray-600 mt-1 ml-11">Xem và phê duyệt các yêu cầu nghỉ phép từ trợ lý</p>
                </div>
            </div>

            {/* Filter */}
            <Card>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                            placeholder="Tìm kiếm theo tên hoặc lý do..."
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
                        <div className="flex items-end">
                            <Button
                                variant="outline"
                                className="bg-transparent"
                                onClick={() => {
                                    setSearchTerm("");
                                    setStatusFilter("All");
                                }}
                            >
                                Xóa bộ lọc
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Table */}
            <Card>
                <AssistantLeaveRequestTable
                    requests={filteredRequests}
                    onView={handleViewRequest}
                    onApprove={handleApprove}
                    onReject={(req) => {
                        setSelectedRequest(req);
                        setIsDetailModalOpen(true);
                    }}
                />
            </Card>

            {/* Detail Modal */}
            <Modal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                title="Chi tiết yêu cầu nghỉ phép"
                size="lg"
            >
                <AssistantLeaveRequestDetail
                    request={selectedRequest}
                    onClose={() => setIsDetailModalOpen(false)}
                    onApprove={handleApprove}
                    onReject={handleReject}
                />
            </Modal>
        </div>
    );
};

export default AssistantLeaveRequests;
