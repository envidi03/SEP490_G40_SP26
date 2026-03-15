import React from "react"

const getStatusBadge = (status) => {
    const colorMap = {
        Confirmed: "bg-teal-50 text-teal-700 border border-teal-200",
        Pending: "bg-amber-50 text-amber-700 border border-amber-200",
        Completed: "bg-blue-50 text-blue-700 border border-blue-200",
        Cancelled: "bg-red-50 text-red-600 border border-red-200",
        CHECKED_IN: "bg-purple-50 text-purple-700 border border-purple-200"
    }
    const color = colorMap[status] || "bg-gray-50 text-gray-600 border border-gray-200";
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${color}`}>{status}</span>;
}

const AppointmentTable = ({ appointments, isLoading, onViewDetail, onCreateRecord }) => {
    return (
        <div className="overflow-x-auto min-h-[300px]">
            {isLoading ? (
                <div className="space-y-3 p-5 animate-pulse">
                    <div className="h-10 bg-gray-100 rounded-xl" />
                    <div className="h-16 bg-gray-50 rounded-xl" />
                    <div className="h-16 bg-gray-50 rounded-xl" />
                </div>
            ) : (
                <table className="w-full text-left text-[13px]">
                    <thead className="bg-white text-gray-400 font-medium text-[12px] uppercase tracking-wider">
                        <tr>
                            <th className="px-5 py-4 w-1 hidden lg:table-cell">Mã LH</th>
                            <th className="px-5 py-4">Thời gian</th>
                            <th className="px-5 py-4">Bệnh nhân / SĐT</th>
                            <th className="px-5 py-4 hidden sm:table-cell">Dịch vụ</th>
                            <th className="px-5 py-4 w-1 whitespace-nowrap">Trạng thái</th>
                            <th className="px-5 py-4 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {appointments.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-5 py-12 text-center text-gray-400 text-sm italic">
                                    Không có lịch hẹn nào phù hợp với bộ lọc
                                </td>
                            </tr>
                        ) : (
                            appointments.map((row) => {
                                const code = row._id?.slice(-6) || "---"
                                const dateStr = row.appointment_date
                                    ? new Date(row.appointment_date).toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' })
                                    : row.date
                                const timeStr = row.appointment_time || row.start_time || row.time || "Theo giờ hẹn"
                                const pName = row.patient_id?.full_name || row.patientName || row.full_name || "Khách vãng lai"
                                const pPhone = row.patient_id?.phone || row.patientPhone || row.phone || "Chưa cập nhật"

                                // Attempt to read service from book_service array
                                let service = row.appointment_type || row.reason || row.notes || "Khám định kỳ"
                                if (row.book_service && row.book_service.length > 0 && row.book_service[0].service_id?.name) {
                                    service = row.book_service.map(s => s.service_id.name).join(', ')
                                } else if (row.book_service && row.book_service.length > 0) {
                                    service = "Đã chọn dịch vụ"
                                }

                                return (
                                    <tr
                                        key={row._id || row.id || code}
                                        className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                                        onClick={() => onViewDetail(row)}
                                    >
                                        <td className="px-5 py-4 whitespace-nowrap text-gray-500 font-mono text-[11px] hidden lg:table-cell">
                                            #{code.toString().slice(-6).toUpperCase()}
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-800">{timeStr}</span>
                                                <span className="text-[11px] text-gray-400 font-medium">{dateStr}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-gray-800">{pName}</span>
                                                <span className="text-[11px] text-gray-500 mt-0.5">{pPhone}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-gray-600 hidden sm:table-cell truncate max-w-[150px]" title={service}>
                                            {service}
                                        </td>
                                        <td className="px-5 py-4 w-1">
                                            {getStatusBadge(row.status)}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onCreateRecord(row) }}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-50 text-teal-700 hover:bg-teal-500 hover:text-white rounded-lg font-medium text-[12px] transition-all border border-teal-200 hover:border-transparent"
                                            >
                                                ➔ Hồ Sơ
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            )}
        </div>
    )
}

export default AppointmentTable
