import React, { useState, useEffect, useMemo } from 'react';
import { Search, UserCheck, Phone, Clock, Loader2, RefreshCw, Filter } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Toast from '../../components/ui/Toast';
import SharedPagination from '../../components/ui/SharedPagination';
import appointmentService from '../../services/appointmentService';
import { formatDate } from '../../utils/dateUtils';

const ReceptionistCheckIn = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 6;
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const todayStr = new Date().toISOString().split('T')[0];

    const fetchTodayAppointments = async () => {
        setLoading(true);
        try {
            const response = await appointmentService.getStaffAppointments({
                page: currentPage,
                limit: limit,
                exclude_status: 'CHECKED_IN,IN_CONSULTATION,COMPLETED,CANCELLED',
                lte_date: todayStr,
                gte_date: todayStr,
                search: searchTerm || undefined
            });
            const resData = response.data;
            const data = resData?.data || resData || [];
            const list = Array.isArray(data) ? data : data.data || [];

            setAppointments(list);

            // Cập nhật tổng số item từ API pagination
            const paginationRes = resData?.pagination || response.pagination || {};
            setTotalItems(paginationRes.totalItems || paginationRes.total_items || list.length);
        } catch (error) {
            console.error('Error fetching check-in list:', error);
            setToast({ show: true, message: 'Lỗi khi tải danh sách tiếp đón', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // Gọi API khi currentPage thay đổi, hoặc khi gõ tìm kiếm (có debounce)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchTodayAppointments();
        }, 500); // 500ms debounce
        return () => clearTimeout(timeoutId);
    }, [currentPage, searchTerm]);

    // Reset pagination khi search thay đổi
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // Pagination calculations
    const totalPages = Math.ceil(totalItems / limit) || 1;

    const handleCheckIn = async (appointmentId) => {
        try {
            await appointmentService.updateAppointmentStatus(appointmentId, 'CHECKED_IN');
            setToast({ show: true, message: 'Check-in thành công!', type: 'success' });
            fetchTodayAppointments();
        } catch (error) {
            console.error('Error during check-in:', error);
            setToast({ show: true, message: 'Lỗi trong quá trình check-in.', type: 'error' });
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Tiếp Đón Bệnh Nhân</h1>
                    <p className="text-gray-600 mt-1">Check-in cho bệnh nhân có lịch hẹn hôm nay ({formatDate(todayStr)})</p>
                </div>
                <button
                    onClick={fetchTodayAppointments}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
                    title="Tải lại"
                >
                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Search & Filter */}
            <Card className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>
            </Card>

            {/* List */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Bệnh nhân
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Giờ hẹn
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Bác sĩ
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 size={30} className="animate-spin text-primary-500" />
                                            <span>Đang tải danh sách...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : appointments.length > 0 ? (
                                appointments.map((apt) => (
                                    <tr key={apt._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                                    <span className="text-blue-600 font-bold">
                                                        {(apt.full_name || 'B').charAt(0)}
                                                    </span>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{apt.full_name}</div>
                                                    <div className="text-xs text-gray-500">{apt.phone}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-900 font-semibold">
                                                <Clock size={16} className={`mr-2 ${apt.status === 'NO_SHOW' ? 'text-red-500' : 'text-gray-400'}`} />
                                                <span className={apt.status === 'NO_SHOW' ? 'text-red-600' : ''}>
                                                    {apt.appointment_time}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {apt.doctor_info?.profile?.full_name || apt.doctorId?.name || 'Chưa chỉ định'}
                                        </td>

                                        {/* --- CỘT TRẠNG THÁI (ĐÃ SỬA LẠI ĐỂ HIỂN THỊ ĐỘNG) --- */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {apt.status === 'NO_SHOW' ? (
                                                <Badge variant="danger" className="bg-red-100 text-red-700">Đến muộn</Badge>
                                            ) : (
                                                <Badge variant="warning">Chờ khám</Badge>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleCheckIn(apt._id)}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 ml-auto"
                                            >
                                                <UserCheck size={18} />
                                                Check In
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        Không có bệnh nhân chờ khám trong hôm nay
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                        <SharedPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            onPageChange={setCurrentPage}
                            itemLabel="bệnh nhân"
                        />
                    </div>
                )}
            </Card>

            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ ...toast, show: false })}
            />
        </div>
    );
};

export default ReceptionistCheckIn;