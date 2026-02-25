import React, { useState, useEffect, useCallback } from 'react';
import { XCircle, Calendar, User, FileText, ChevronLeft, ChevronRight, Loader2, History } from 'lucide-react';
import { formatDate, formatDateTime } from '../../../../utils/dateUtils';
import roomService from '../../../../services/roomService';

const RoomDetailModal = ({
    show,
    room,
    onClose,
    getStatusColor,
    getStatusText,
}) => {
    // ===== STATE =====
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(false);

    // History pagination & filter
    const [historyPage, setHistoryPage] = useState(1);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [pendingStart, setPendingStart] = useState('');
    const [pendingEnd, setPendingEnd] = useState('');

    // Room service pagination
    const [servicePage, setServicePage] = useState(1);

    const HISTORY_LIMIT = 5;
    const SERVICE_LIMIT = 5;

    // ===== FETCH =====
    const fetchDetail = useCallback(async (hPage, sPage, sDate, eDate) => {
        if (!room?._id) return;
        setLoading(true);
        try {
            const params = {
                historyPage: hPage,
                historyLimit: HISTORY_LIMIT,
                serviceRoomPage: sPage,
                serviceRoomLimit: SERVICE_LIMIT,
                ...(sDate && { startDate: sDate }),
                ...(eDate && { endDate: eDate }),
            };
            const res = await roomService.getRoomById(room._id, params);
            setDetail(res?.data?.data || null);
        } catch (err) {
            console.error('Error fetching room detail:', err);
        } finally {
            setLoading(false);
        }
    }, [room?._id]);

    // Reset và fetch khi modal mở
    useEffect(() => {
        if (show && room?._id) {
            setHistoryPage(1);
            setServicePage(1);
            setStartDate('');
            setEndDate('');
            setPendingStart('');
            setPendingEnd('');
            fetchDetail(1, 1, '', '');
        }
    }, [show, room?._id]);

    if (!show || !room) return null;

    // ===== HANDLERS =====
    const handleApplyFilter = () => {
        setStartDate(pendingStart);
        setEndDate(pendingEnd);
        setHistoryPage(1);
        fetchDetail(1, servicePage, pendingStart, pendingEnd);
    };

    const handleHistoryPageChange = (newPage) => {
        setHistoryPage(newPage);
        fetchDetail(newPage, servicePage, startDate, endDate);
    };

    const handleServicePageChange = (newPage) => {
        setServicePage(newPage);
        fetchDetail(historyPage, newPage, startDate, endDate);
    };

    // ===== DATA =====
    const historyItems = detail?.history_used?.items || [];
    const historyPagination = detail?.history_used?.pagination || {};
    const historyTotalPages = historyPagination.totalPages || 1;

    const serviceItems = detail?.room_service?.items || [];
    const servicePagination = detail?.room_service?.pagination || {};
    const serviceTotalPages = servicePagination.totalPages || 1;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity backdrop-blur-sm" onClick={onClose} />
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl transform transition-all flex flex-col max-h-[90vh]">

                    {/* Header */}
                    <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-t-2xl flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <History size={24} />
                                Chi tiết phòng: {room.room_number}
                            </h2>
                            <p className="text-blue-100 mt-1">Thông tin và lịch sử sử dụng phòng</p>
                        </div>
                        <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                            <XCircle size={28} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="p-6 overflow-y-auto flex-1">

                        {/* Room Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">Trạng thái</p>
                                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(room.status)} bg-white`}>
                                    {getStatusText(room.status)}
                                </span>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">Ghi chú</p>
                                <p className="text-gray-800 font-medium">{room.note || '—'}</p>
                            </div>
                        </div>

                        {/* Services Section */}
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                                <FileText size={18} className="text-blue-600" />
                                Dịch vụ phòng
                                {servicePagination.totalItems !== undefined && (
                                    <span className="ml-2 text-sm font-normal text-gray-500">({servicePagination.totalItems} dịch vụ)</span>
                                )}
                            </h3>

                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="animate-spin text-blue-600" size={32} />
                                </div>
                            ) : serviceItems.length > 0 ? (
                                <>
                                    <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">#</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Dịch vụ ID</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Ghi chú</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {serviceItems.map((item, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-sm text-gray-500">{(servicePage - 1) * SERVICE_LIMIT + idx + 1}</td>
                                                        <td className="px-4 py-3 text-sm font-mono text-gray-700">{item.service_id || '—'}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">{item.note || '—'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {/* Service Pagination */}
                                    {serviceTotalPages > 1 && (
                                        <PaginationBar
                                            page={servicePage}
                                            totalPages={serviceTotalPages}
                                            onPageChange={handleServicePageChange}
                                        />
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-8 text-gray-400 italic bg-gray-50 rounded-xl">
                                    Chưa có dịch vụ nào được gán cho phòng này
                                </div>
                            )}
                        </div>

                        {/* History Used Section */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2">
                                <History size={18} className="text-blue-600" />
                                Lịch sử sử dụng phòng
                                {historyPagination.totalItems !== undefined && (
                                    <span className="ml-2 text-sm font-normal text-gray-500">({historyPagination.totalItems} bản ghi)</span>
                                )}
                            </h3>

                            {/* Date Filter */}
                            <div className="flex flex-wrap items-end gap-4 mb-5 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Từ ngày</label>
                                    <input
                                        type="date"
                                        value={pendingStart}
                                        onChange={e => setPendingStart(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Đến ngày</label>
                                    <input
                                        type="date"
                                        value={pendingEnd}
                                        onChange={e => setPendingEnd(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    />
                                </div>
                                <button
                                    onClick={handleApplyFilter}
                                    className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Lọc dữ liệu
                                </button>
                                {(startDate || endDate) && (
                                    <button
                                        onClick={() => {
                                            setPendingStart('');
                                            setPendingEnd('');
                                            setStartDate('');
                                            setEndDate('');
                                            setHistoryPage(1);
                                            fetchDetail(1, servicePage, '', '');
                                        }}
                                        className="px-4 py-2 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors border border-gray-300 bg-white"
                                    >
                                        Xóa bộ lọc
                                    </button>
                                )}
                            </div>

                            {/* Table */}
                            {loading ? (
                                <div className="flex justify-center py-10">
                                    <Loader2 className="animate-spin text-blue-600" size={32} />
                                </div>
                            ) : (
                                <>
                                    <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ngày sử dụng</th>
                                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Giờ</th>
                                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Bác sĩ</th>
                                                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ghi chú</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {historyItems.length > 0 ? (
                                                    historyItems.map((item, idx) => (
                                                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                <div className="flex items-center gap-2">
                                                                    <Calendar size={14} className="text-blue-500" />
                                                                    {item.used_date ? formatDate(item.used_date) : '—'}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                                {item.used_date ? new Date(item.used_date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                                                                <div className="flex items-center gap-2">
                                                                    <User size={14} />
                                                                    {item.doctor_use?.full_name || item.doctor_use || 'Chưa xác định'}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                                {item.note || '—'}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="4" className="px-6 py-10 text-center text-gray-400 italic">
                                                            Không có lịch sử sử dụng{(startDate || endDate) ? ' trong khoảng thời gian này' : ''}
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    {historyTotalPages > 1 && (
                                        <PaginationBar
                                            page={historyPage}
                                            totalPages={historyTotalPages}
                                            onPageChange={handleHistoryPageChange}
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 p-4 rounded-b-2xl border-t border-gray-200 flex justify-end">
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

// ===== Pagination Component =====
const PaginationBar = ({ page, totalPages, onPageChange }) => {
    const pages = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) pages.push(i);

    return (
        <div className="flex items-center justify-center gap-1 mt-2">
            <button
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                <ChevronLeft size={16} />
            </button>
            {pages.map(p => (
                <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium border transition-colors ${p === page
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    {p}
                </button>
            ))}
            <button
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
                <ChevronRight size={16} />
            </button>
        </div>
    );
};

export default RoomDetailModal;
