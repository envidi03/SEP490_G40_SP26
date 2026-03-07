import React from 'react';

const statusConfig = {
    PENDING: { label: 'Chờ duyệt', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
    APPROVED: { label: 'Đã duyệt', bg: 'bg-teal-50 text-teal-700 border-teal-200' },
    REJECTED: { label: 'Từ chối', bg: 'bg-red-50 text-red-600 border-red-200' },
};

const typeConfig = {
    SICK_LEAVE: 'Nghỉ ốm',
    ANNUAL_LEAVE: 'Nghỉ phép năm',
    PERSONAL_LEAVE: 'Việc riêng'
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const LeaveRequestTable = ({ requests }) => {
    if (!requests || requests.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-16 text-center">
                <p className="text-sm font-medium text-gray-500">Chưa có yêu cầu nghỉ phép nào</p>
                <p className="text-xs text-gray-400 mt-1">Các đơn xin nghỉ phép của bạn sẽ hiển thị tại đây</p>
            </div>
        );
    }

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
