import React from 'react';
import { PackageSearch, Check, X, AlertCircle } from 'lucide-react';
import { formatDate } from '../../../../utils/dateUtils';

const RestockTable = ({ requests, onApprove, onReject }) => {
    const getStatusBadge = (status) => {
        const badges = {
            'pending': <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">Chờ duyệt</span>,
            'accept': <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">Đã duyệt</span>,
            'reject': <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">Đã từ chối</span>,
            'completed': <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">Hoàn thành</span>
        };
        return badges[status] || <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">{status}</span>;
    };

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'high':
                return (
                    <div className="flex items-center gap-1 text-red-600">
                        <AlertCircle size={14} className="animate-pulse" />
                        <span className="text-xs font-bold">Cao</span>
                    </div>
                );
            case 'medium':
                return <span className="text-xs font-medium text-yellow-600">Bình thường</span>;
            case 'low':
                return <span className="text-xs font-medium text-gray-500">Thấp</span>;
            default:
                return null;
        }
    };

    if (requests.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-lg p-16 text-center border border-gray-100">
                <PackageSearch className="text-gray-300 mx-auto mb-4" size={64} />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Không có dữ liệu
                </h3>
                <p className="text-gray-500">
                    Không tìm thấy yêu cầu nhập thuốc nào phù hợp.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Thông tin Thuốc</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Tồn kho / Yêu cầu</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Độ ưu tiên</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Người gửi</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {requests.map((req) => (
                            <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-semibold text-gray-900">{req.medicine_name}</div>
                                    <div className="text-xs text-gray-500 mt-1">Lý do: {req.reason || 'Không có'}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                        <div className="text-sm">
                                            <span className="text-gray-500">Hiện tại: </span>
                                            <span className="font-semibold text-gray-900">{req.current_quantity}</span>
                                        </div>
                                        <div className="text-sm">
                                            <span className="text-gray-500">Xin thêm: </span>
                                            <span className="font-bold text-blue-600">+{req.quantity_requested}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {getPriorityBadge(req.priority)}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">{req.request_by_name}</div>
                                    <div className="text-xs text-gray-500">{formatDate(req.created_at)}</div>
                                </td>
                                <td className="px-6 py-4">
                                    {getStatusBadge(req.status)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {req.status === 'pending' ? (
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => onApprove(req)}
                                                className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors tooltip-trigger"
                                                title="Duyệt yêu cầu"
                                            >
                                                <Check size={18} />
                                            </button>
                                            <button
                                                onClick={() => onReject(req)}
                                                className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors tooltip-trigger"
                                                title="Từ chối yêu cầu"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 text-sm italic">Đã xử lý</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RestockTable;
