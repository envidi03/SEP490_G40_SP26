import React, { useState } from 'react';
import { XCircle } from 'lucide-react';

const RoomDetailModal = ({
    show,
    room,
    onClose,
    getStatusColor,
    getStatusText,
    getAssignedDoctors
}) => {
    if (!show || !room) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm" onClick={onClose} />
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl transform transition-all flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="relative bg-white border-b border-gray-200 p-6 rounded-t-2xl flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                View Detail Room: {room.room_number}
                            </h2>
                            <p className="text-gray-500 mt-1">
                                Chi tiết thông tin và lịch sử sử dụng phòng
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <XCircle size={28} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="p-6 overflow-y-auto custom-scrollbar">
                        {/* Room Info Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Trạng thái hiện tại</label>
                                    <div className={`mt-1 inline-flex px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(room.status)} bg-white`}>
                                        {getStatusText(room.status)}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Loại phòng</label>
                                    <p className="text-gray-900 font-medium">{room.room_type || 'Phòng khám tiêu chuẩn'}</p>
                                </div>
                                {room.description && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Ghi chú / Mô tả</label>
                                        <p className="text-gray-700 bg-gray-50 p-2 rounded-lg text-sm mt-1">{room.description}</p>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Bác sĩ phụ trách chính</label>
                                    <div className="mt-1">
                                        {getAssignedDoctors(room.id).length > 0 ? (
                                            getAssignedDoctors(room.id).map((doc, idx) => (
                                                <span key={idx} className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm mr-2 mb-2">
                                                    {doc.full_name}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-gray-400 italic">Chưa phân công</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Trang thiết bị chính</label>
                                    <p className="text-gray-900 font-medium whitespace-pre-line">
                                        {room.equipment || 'Ghế nha khoa, Đèn LED, Máy X-Quang tại chỗ'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* History Used Section */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                                History used
                            </h3>

                            {/* Date Filter */}
                            <div className="flex flex-wrap items-center gap-4 mb-6">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-600 font-medium">Start:</span>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            className="pl-3 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                            defaultValue="2025-10-01"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-600 font-medium">End:</span>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            className="pl-3 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                            defaultValue="2025-10-31"
                                        />
                                    </div>
                                </div>
                                <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                                    Lọc dữ liệu
                                </button>
                            </div>

                            {/* History Table */}
                            <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ngày</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Thời gian</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Bác sĩ</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Bệnh nhân</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Hoạt động</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {[
                                            { date: '21/01/2026', time: '08:00 - 09:00', doctor: 'Dr. Nguyen Van A', patient: 'Tran Thi B', action: 'Khám tổng quát' },
                                            { date: '21/01/2026', time: '09:30 - 10:30', doctor: 'Dr. Le Van C', patient: 'Hoang Van D', action: 'Niềng răng' },
                                            { date: '20/01/2026', time: '14:00 - 15:00', doctor: 'Dr. Nguyen Van A', patient: 'Pham Thi E', action: 'Nhổ răng khôn' },
                                            { date: '19/01/2026', time: '10:00 - 11:30', doctor: 'Dr. Tran Thi F', patient: 'Le Van G', action: 'Cấy ghép Implant' },
                                            { date: '18/01/2026', time: '15:30 - 16:30', doctor: 'Dr. Le Van C', patient: 'Nguyen Van H', action: 'Tẩy trắng răng' },
                                        ].map((item, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.date}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.time}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{item.doctor}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.patient}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                                                        {item.action}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex justify-center gap-2">
                                <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50 text-gray-600 disabled:opacity-50">
                                    &lt;
                                </button>
                                <button className="w-8 h-8 flex items-center justify-center rounded bg-blue-600 text-white font-medium shadow-sm">
                                    1
                                </button>
                                <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50 text-gray-600 font-medium">
                                    2
                                </button>
                                <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50 text-gray-600 font-medium">
                                    3
                                </button>
                                <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50 text-gray-600 font-medium">
                                    4
                                </button>
                                <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50 text-gray-600 disabled:opacity-50">
                                    &gt;
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 p-6 rounded-b-2xl border-t border-gray-200 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomDetailModal;
