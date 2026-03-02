import React from 'react';
import { Eye, Check, X } from 'lucide-react';
import Badge from '../../../../components/ui/Badge';
import Button from '../../../../components/ui/Button';

const AssistantLeaveRequestTable = ({ requests, onView, onApprove, onReject }) => {
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

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Trợ lý
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Loại nghỉ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Thời gian
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Lý do
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Trạng thái
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Thao tác
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {requests.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                Không có yêu cầu nào
                            </td>
                        </tr>
                    ) : (
                        requests.map((req) => (
                            <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                                            {req.userName?.charAt(0) || 'U'}
                                        </div>
                                        <div className="ml-3">
                                            <div className="text-sm font-medium text-gray-900">{req.userName}</div>
                                            <div className="text-xs text-gray-500">{req.userEmail}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {getTypeLabel(req.type)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div>{formatDate(req.startDate)} - {formatDate(req.endDate)}</div>
                                    <div className="text-xs text-gray-400">
                                        {Math.ceil((new Date(req.endDate) - new Date(req.startDate)) / (1000 * 60 * 60 * 24)) + 1} ngày
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                    {req.reason}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getStatusBadge(req.status)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onView(req)}
                                        title="Xem chi tiết"
                                    >
                                        <Eye size={18} className="text-gray-500 hover:text-primary-600" />
                                    </Button>

                                    {req.status === 'PENDING' && (
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onApprove(req)}
                                                title="Phê duyệt"
                                            >
                                                <Check size={18} className="text-green-500 hover:text-green-700" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onReject(req)}
                                                title="Từ chối"
                                            >
                                                <X size={18} className="text-red-500 hover:text-red-700" />
                                            </Button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default AssistantLeaveRequestTable;
