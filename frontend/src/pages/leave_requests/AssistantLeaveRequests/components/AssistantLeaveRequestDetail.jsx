import React, { useState } from 'react';
import Button from '../../../../components/ui/Button';
import Badge from '../../../../components/ui/Badge';

const AssistantLeaveRequestDetail = ({ request, onClose, onApprove, onReject }) => {
    const [rejectReason, setRejectReason] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);

    if (!request) return null;

    const getStatusBadge = (status) => {
        switch (status) {
            case 'APPROVED':
                return <Badge variant="success">Đã duyệt</Badge>;
            case 'REJECTED':
                return <Badge variant="danger">Từ chối</Badge>;
            default:
                return <Badge variant="warning">Chờ duyệt</Badge>;
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'SICK_LEAVE': return 'Nghỉ ốm';
            case 'ANNUAL_LEAVE': return 'Nghỉ phép năm';
            case 'PERSONAL_LEAVE': return 'Việc riêng';
            default: return type;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const handleRejectSubmit = () => {
        if (!rejectReason.trim()) {
            alert('Vui lòng nhập lý do từ chối');
            return;
        }
        onReject(request, rejectReason);
    };

    return (
        <div className="space-y-6">
            {/* Header Info */}
            <div className="flex items-start justify-between border-b pb-4">
                <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xl">
                        {request.userName?.charAt(0) || 'U'}
                    </div>
                    <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">{request.userName}</h3>
                        <p className="text-sm text-gray-500">{request.userEmail}</p>
                    </div>
                </div>
                <div>
                    {getStatusBadge(request.status)}
                </div>
            </div>

            {/* Request Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-500">Loại nghỉ phép</label>
                    <p className="mt-1 text-sm text-gray-900 font-medium">{getTypeLabel(request.type)}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-500">Ngày gửi yêu cầu</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(request.createdAt)}</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-500">Thời gian nghỉ</label>
                    <p className="mt-1 text-sm text-gray-900">
                        {formatDate(request.startDate)} - {formatDate(request.endDate)}
                    </p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-500">Tổng số ngày</label>
                    <p className="mt-1 text-sm text-gray-900">
                        {Math.ceil((new Date(request.endDate) - new Date(request.startDate)) / (1000 * 60 * 60 * 24)) + 1} ngày
                    </p>
                </div>
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-500">Lý do</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm text-gray-900">
                        {request.reason}
                    </div>
                </div>

                {request.status === 'REJECTED' && request.rejectionReason && (
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-red-500">Lý do từ chối</label>
                        <div className="mt-1 p-3 bg-red-50 rounded-md text-sm text-red-700 border border-red-100">
                            {request.rejectionReason}
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            {request.status === 'PENDING' && (
                <div className="pt-4 border-t mt-6">
                    {isRejecting ? (
                        <div className="space-y-3 animate-fadeIn">
                            <label className="block text-sm font-medium text-gray-700">
                                Nhập lý do từ chối <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                                rows="3"
                                placeholder="Nhập lý do từ chối..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                            ></textarea>
                            <div className="flex justify-end space-x-3">
                                <Button variant="outline" onClick={() => setIsRejecting(false)}>
                                    Hủy
                                </Button>
                                <Button variant="danger" onClick={handleRejectSubmit}>
                                    Xác nhận từ chối
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-end space-x-3">
                            <Button variant="outline" onClick={onClose}>
                                Đóng
                            </Button>
                            <Button variant="danger" onClick={() => setIsRejecting(true)}>
                                Từ chối
                            </Button>
                            <Button variant="primary" onClick={() => onApprove(request)}>
                                Phê duyệt
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {request.status !== 'PENDING' && (
                <div className="flex justify-end pt-4 border-t mt-6">
                    <Button variant="outline" onClick={onClose}>
                        Đóng
                    </Button>
                </div>
            )}
        </div>
    );
};

export default AssistantLeaveRequestDetail;
