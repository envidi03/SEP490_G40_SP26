import React from 'react';
import { Pencil, XCircle } from 'lucide-react';
import Table from '../../../components/ui/Table';
import Badge from '../../../components/ui/Badge';

const LeaveRequestTable = ({ requests, onEdit, onCancel }) => {
    const columns = [
        {
            header: 'Ngày gửi',
            accessor: 'createdAt',
            render: (row) => new Date(row.createdAt).toLocaleDateString('vi-VN')
        },
        {
            header: 'Từ ngày',
            accessor: 'startedDate',
            render: (row) => new Date(row.startedDate).toLocaleDateString('vi-VN')
        },
        {
            header: 'Đến ngày',
            accessor: 'endDate',
            render: (row) => new Date(row.endDate).toLocaleDateString('vi-VN')
        },
        {
            header: 'Loại nghỉ',
            accessor: 'type',
            render: (row) => {
                const types = {
                    'SICK': 'Nghỉ ốm',
                    'ANNUAL': 'Nghỉ phép năm',
                    'MATERNITY': 'Thai sản',
                    'UNPAID': 'Không lương',
                    'BEREAVEMENT': 'Tang chế',
                    'EMERGENCY': 'Khẩn cấp'
                };
                return types[row.type] || row.type;
            }
        },
        {
            header: 'Lý do',
            accessor: 'reason',
            className: 'max-w-xs truncate'
        },
        {
            header: 'Trạng thái',
            accessor: 'status',
            render: (row) => {
                const variants = {
                    'PENDING': 'warning',
                    'APPROVED': 'success',
                    'REJECTED': 'danger'
                };
                const labels = {
                    'PENDING': 'Chờ duyệt',
                    'APPROVED': 'Đã duyệt',
                    'REJECTED': 'Từ chối'
                };
                return <Badge variant={variants[row.status] || 'default'}>{labels[row.status] || row.status}</Badge>;
            }
        },
        {
            header: 'Thao tác',
            accessor: 'actions',
            render: (row) => {
                if (row.status !== 'PENDING') return null; // Only allow edit/cancel if pending
                return (
                    <div className="flex space-x-2">
                        <button onClick={() => onEdit(row)} className="p-1 flex items-center justify-center text-blue-600 hover:bg-blue-50 text-xs rounded transition-colors" title="Sửa">
                            <Pencil size={16} />
                        </button>
                        <button onClick={() => onCancel(row)} className="p-1 flex items-center justify-center text-red-600 hover:bg-red-50 text-xs rounded transition-colors" title="Hủy">
                            <XCircle size={16} />
                        </button>
                    </div>
                );
            }
        }
    ];

    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                    <thead className="bg-gray-50/50 text-gray-500 font-medium">
                        <tr>
                            <th className="px-5 py-4 font-semibold w-1">Trạng thái</th>
                            <th className="px-5 py-4 font-semibold">Ngày gửi</th>
                            <th className="px-5 py-4 font-semibold">T.gian nghỉ</th>
                            <th className="px-5 py-4 font-semibold">Loại nghỉ</th>
                            <th className="px-5 py-4 font-semibold">Lý do</th>
                            <th className="px-5 py-4 font-semibold text-right">Phản hồi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {requests.map((row) => {
                            const st = statusConfig[row.status] || { label: row.status, bg: 'bg-gray-50 text-gray-600 border-gray-200' };
                            return (
                                <tr key={row._id || row.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-5 py-3 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border w-max ${st.bg}`}>
                                            {st.label}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                                        {formatDate(row.createdAt)}
                                    </td>
                                    <td className="px-5 py-3 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-700">{formatDate(row.startDate)}</span>
                                            <span className="text-[11px] text-gray-400">đến {formatDate(row.endDate)}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 font-medium text-gray-700 whitespace-nowrap">
                                        {typeConfig[row.leave_type] || row.leave_type || 'Nghỉ phép'}
                                    </td>
                                    <td className="px-5 py-3 text-gray-600 max-w-[200px] truncate" title={row.reason}>
                                        {row.reason}
                                    </td>
                                    <td className="px-5 py-3 text-right max-w-[150px] truncate text-gray-500 text-[12px]" title={row.comment}>
                                        {row.comment || '-'}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LeaveRequestTable;
