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
        <Table
            data={requests}
            columns={columns}
            emptyMessage="Chưa có yêu cầu nghỉ phép nào"
        />
    );
};

export default LeaveRequestTable;
