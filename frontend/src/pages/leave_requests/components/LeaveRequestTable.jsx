import React from 'react';
import Table from '../../../components/ui/Table';
import Badge from '../../../components/ui/Badge';

const LeaveRequestTable = ({ requests }) => {
    const columns = [
        {
            header: 'Ngày gửi',
            accessor: 'createdAt',
            render: (row) => new Date(row.createdAt).toLocaleDateString('vi-VN')
        },
        {
            header: 'Từ ngày',
            accessor: 'startDate',
            render: (row) => new Date(row.startDate).toLocaleDateString('vi-VN')
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
                    'sick': 'Nghỉ ốm',
                    'vacation': 'Nghỉ phép',
                    'personal': 'Việc riêng',
                    'other': 'Khác'
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
                    'Pending': 'warning',
                    'Approved': 'success',
                    'Rejected': 'danger'
                };
                const labels = {
                    'Pending': 'Chờ duyệt',
                    'Approved': 'Đã duyệt',
                    'Rejected': 'Từ chối'
                };
                return <Badge variant={variants[row.status] || 'default'}>{labels[row.status] || row.status}</Badge>;
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
