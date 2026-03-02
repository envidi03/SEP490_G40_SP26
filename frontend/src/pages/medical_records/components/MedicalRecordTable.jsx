import React from 'react';
import { Eye, FilePlus, Calendar, User } from 'lucide-react';
import Table from '../../../components/ui/Table';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';

const MedicalRecordTable = ({ appointments, onViewDetail, onCreateRecord }) => {
    const columns = [
        {
            header: 'Mã LH',
            accessor: 'code',
            render: (row) => <span className="font-medium text-blue-600">{row.code}</span>,
        },
        {
            header: 'Bệnh nhân',
            accessor: 'patientName',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-full">
                        <User size={16} className="text-gray-600" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">{row.patientName}</p>
                        <p className="text-sm text-gray-500">{row.patientPhone}</p>
                    </div>
                </div>
            ),
        },
        {
            header: 'Thời gian khám',
            accessor: 'date',
            render: (row) => (
                <div className="flex items-center gap-2 text-gray-700">
                    <Calendar size={16} className="text-gray-400" />
                    <span>{row.date} - {row.time}</span>
                </div>
            ),
        },
        {
            header: 'Lý do khám',
            accessor: 'reason',
        },
        {
            header: 'Trạng thái',
            accessor: 'status',
            render: (row) => (
                <Badge variant={row.status === 'Completed' ? 'success' : 'default'}>
                    {row.status === 'Completed' ? 'Đã khám' : row.status}
                </Badge>
            ),
        },
        {
            header: 'Thao tác',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetail(row)}
                        className="flex items-center gap-1 text-gray-600 border-gray-300 hover:bg-gray-50"
                    >
                        <Eye size={14} />
                        Chi tiết
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => onCreateRecord(row)}
                        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <FilePlus size={14} />
                        Tạo hồ sơ
                    </Button>
                </div>
            ),
        },
    ];

    return <Table columns={columns} data={appointments} />;
};

export default MedicalRecordTable;
