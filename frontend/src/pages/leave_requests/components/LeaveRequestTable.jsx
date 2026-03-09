import React from 'react';
import { Pencil, XCircle } from 'lucide-react';
import Table from '../../../components/ui/Table';
import Badge from '../../../components/ui/Badge';
import { formatDate } from '../../../utils/dateUtils';

const LeaveRequestTable = ({ requests = [], onEdit = () => { }, onCancel = () => { } }) => {
    const columns = [
        {
            header: 'Trạng thái',
            accessor: 'status',
            render: (row) => {
                const variants = {
                    'PENDING': 'warning',
                    'APPROVED': 'success',
                    'REJECTED': 'danger',
                    'DRAFT': 'default'
                };
                const labels = {
                    'PENDING': 'Chờ duyệt',
                    'APPROVED': 'Đã duyệt',
                    'REJECTED': 'Từ chối',
                    'DRAFT': 'Lưu nháp'
                };
                return <Badge variant={variants[row.status] || 'default'}>{labels[row.status] || row.status}</Badge>;
            }
        },
        {
            header: 'Ngày gửi',
            accessor: 'createdAt',
            render: (row) => formatDate(row.createdAt)
        },
        {
            header: 'Thời gian nghỉ',
            accessor: 'startedDate',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-medium text-gray-700">{formatDate(row.startedDate)}</span>
                    <span className="text-[11px] text-gray-400 font-normal">đến {formatDate(row.endDate)}</span>
                </div>
            )
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
                return <span className="font-medium text-gray-700">{types[row.type] || row.type}</span>;
            }
        },
        {
            header: 'Lý do',
            accessor: 'reason',
            render: (row) => (
                <div className="max-w-xs truncate text-gray-600" title={row.reason}>
                    {row.reason}
                </div>
            )
        },
        {
            header: 'Phản hồi',
            accessor: 'comment',
            render: (row) => (
                <div className="max-w-[150px] truncate text-gray-500 text-[12px]" title={row.comment}>
                    {row.comment || '-'}
                </div>
            )
        },
        {
            header: 'Thao tác',
            accessor: 'actions',
            render: (row) => {
                if (row.status !== 'PENDING' && row.status !== 'DRAFT') return null;
                return (
                    <div className="flex space-x-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(row); }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                            title="Chỉnh sửa"
                        >
                            <Pencil size={15} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onCancel(row); }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                            title="Hủy yêu cầu"
                        >
                            <XCircle size={15} />
                        </button>
                    </div>
                );
            }
        }
    ];

    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <Table columns={columns} data={requests} />
        </div>
    );
};

export default LeaveRequestTable;
