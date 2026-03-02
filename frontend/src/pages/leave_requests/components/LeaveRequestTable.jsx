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
                    'SICK_LEAVE': 'Nghỉ ốm',
                    'ANNUAL_LEAVE': 'Nghỉ phép năm',
                    'PERSONAL_LEAVE': 'Việc riêng'
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
