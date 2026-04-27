import React, { useState, useEffect } from 'react';
import { DollarSign, Search, FileText, CheckCircle, Clock, Eye, CreditCard, Plus, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Toast from '../../components/ui/Toast';
import InvoiceDetailModal from './components/modals/InvoiceDetailModal';
import CreateInvoiceModal from './components/modals/CreateInvoiceModal';
import PaymentModal from './components/modals/PaymentModal';
import TreatmentDetailModal from './components/modals/TreatmentDetailModal'; // Component mới
import billingService from '../../services/billingService';
import appointmentService from '../../services/appointmentService';

const ReceptionistInvoices = () => {
    // --- State Dữ liệu ---
    const [appointmentsToPay, setAppointmentsToPay] = useState([]);
    console.log("appointmentsToPay: ", appointmentsToPay);
    
    const [pagination, setPagination] = useState({
        total_items: 0,
        total_pages: 1,
        current_page: 1,
        limit: 10
    });
    const [stats, setStats] = useState({ totalAmount: 0, paidAmount: 0, pendingAmount: 0 });
    const [loading, setLoading] = useState(false);

    // --- State Bộ lọc (Filters) ---
    const [searchInput, setSearchInput] = useState('');
    const [appliedSearch, setAppliedSearch] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    // --- State Modals & Thông báo ---
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    
    // State cho Modal Chi tiết Treatment
    const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);
    const [selectedAppointmentForTreatment, setSelectedAppointmentForTreatment] = useState(null);

    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // --- Gọi API lấy dữ liệu ---
    const fetchData = async (page = 1) => {
        setLoading(true);
        try {
            const params = {
                page: page,
                limit: pagination.limit
            };

            if (appliedSearch) params.search = appliedSearch;
            if (dateFilter) params.date_filter = dateFilter;

            // 1. Gọi API danh sách lịch hẹn chờ thanh toán
            const res = await appointmentService.getAppointmentsToPayment(params);
            console.log('Danh sách lịch hẹn chờ thanh toán:', res);
            if (res) {
                setAppointmentsToPay(res.data || []);
                if (res.pagination) {
                    setPagination(res.pagination);
                }
            }

            // 2. Gọi API lấy thống kê tổng quan hóa đơn
            try {
                const statsRes = await billingService.getInvoiceStats();
                const statData = statsRes?.data?.data || statsRes?.data || {};
                setStats({
                    totalAmount: statData.totalRevenue || 0,
                    paidAmount: statData.totalRevenue || 0, // Giả định COMPLETED = Paid
                    pendingAmount: statData.totalPendingAmount || 0,
                });
            } catch (statsErr) {
                console.warn('Không thể tải thống kê', statsErr);
            }

        } catch (err) {
            console.error('Lỗi khi tải danh sách thanh toán:', err);
            setToast({ show: true, message: 'Lỗi tải danh sách thanh toán', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // --- Effects ---
    // Debounce cho ô tìm kiếm
    useEffect(() => {
        const timer = setTimeout(() => {
            setAppliedSearch(searchInput);
            // Nếu đang không ở trang 1 mà gõ tìm kiếm, tự động quay về trang 1
            if (pagination.current_page !== 1) {
                setPagination(prev => ({ ...prev, current_page: 1 }));
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput]);

    // Lắng nghe thay đổi để gọi lại API
    useEffect(() => {
        fetchData(pagination.current_page);
    }, [appliedSearch, dateFilter, pagination.current_page]);

    // Dọn dẹp selectedInvoice khi đóng các modal để tránh rò rỉ bộ nhớ
    useEffect(() => {
        if (!isDetailModalOpen && !isPaymentModalOpen && !isCreateModalOpen) {
            const timer = setTimeout(() => setSelectedInvoice(null), 300);
            return () => clearTimeout(timer);
        }
    }, [isDetailModalOpen, isPaymentModalOpen, isCreateModalOpen]);

    // Dọn dẹp state khi đóng treatment modal
    useEffect(() => {
        if (!isTreatmentModalOpen) {
            const timer = setTimeout(() => setSelectedAppointmentForTreatment(null), 300);
            return () => clearTimeout(timer);
        }
    }, [isTreatmentModalOpen]);

    // --- Handlers ---
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.total_pages) {
            setPagination(prev => ({ ...prev, current_page: newPage }));
        }
    };

    const handleCreateInvoiceClick = (appointmentItem) => {
        console.log("appointmentItem: ", appointmentItem);
        setSelectedInvoice(appointmentItem);
        setIsCreateModalOpen(true);
    };

    const handleViewTreatments = (appointmentItem) => {
        setSelectedAppointmentForTreatment(appointmentItem);
        setIsTreatmentModalOpen(true);
    };

    const handlePayment = async (invoice) => {
        // Dùng khi người dùng click thanh toán từ Modal Chi tiết
        if (invoice.payment_method === 'TRANSFER') {
            setSelectedInvoice(invoice);
            setIsPaymentModalOpen(true);
            return;
        }

        try {
            await billingService.updateInvoiceStatus(invoice._id || invoice.id, {
                status: 'COMPLETED',
                payment_method: 'CASH',
                note: 'Thanh toán tiền mặt'
            });
            setToast({
                show: true,
                message: `Thanh toán thành công!`,
                type: 'success'
            });
            fetchData(pagination.current_page);
            setIsDetailModalOpen(false);
        } catch (error) {
            console.error(error);
            setToast({ show: true, message: error.response?.data?.message || 'Có lỗi xảy ra khi thu tiền.', type: 'error' });
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Danh Sách Chờ Thanh Toán</h1>
                    <p className="text-gray-600 mt-1">Các lịch hẹn đã hoàn thành điều trị và cần xuất hóa đơn</p>
                </div>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo Tên hoặc Số điện thoại khách hàng..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    {/* Lọc theo ngày */}
                    <div className="flex-shrink-0">
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-700"
                            title="Lọc theo ngày hoàn thành lịch hẹn"
                        />
                    </div>
                </div>
            </Card>

            {/* Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày & Giờ Hẹn</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lý do khám</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tổng tiền chờ thu</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trạng thái HĐ</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center">
                                        <Loader2 size={30} className="mx-auto animate-spin text-primary-500 mb-2" />
                                        <p className="text-gray-500">Đang tải dữ liệu...</p>
                                    </td>
                                </tr>
                            ) : appointmentsToPay.length > 0 ? (
                                appointmentsToPay.map((item) => (
                                    <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{item.full_name}</div>
                                            <div className="text-xs text-gray-500">{item.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-600">
                                                {new Date(item.appointment_date).toLocaleDateString('vi-VN')}
                                                <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded text-xs font-medium">
                                                    {item.appointment_time}
                                                </span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600 line-clamp-2" title={item.reason}>
                                                {item.reason || 'Không có'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-sm font-bold text-red-600">
                                                {(item.total_payment_amount || 0).toLocaleString('vi-VN')}đ
                                            </span>
                                            <div 
                                                className="text-xs text-primary-600 mt-1 flex items-center justify-end gap-1 cursor-pointer hover:text-primary-800 hover:underline transition-colors"
                                                onClick={() => handleViewTreatments(item)}
                                            >
                                                <Eye size={14} /> Xem chi tiết ({item.treatments_to_pay?.length || 0} DV)
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <Badge variant="warning">Chưa tạo / Chờ thu</Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button
                                                onClick={() => handleCreateInvoiceClick(item)}
                                                className="inline-flex px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors items-center gap-1.5 shadow-sm"
                                            >
                                                <Plus size={16} /> Tạo Hóa Đơn
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-16 text-center text-gray-500 bg-gray-50/50">
                                        <CheckCircle size={40} className="mx-auto text-gray-300 mb-3" />
                                        <p className="text-base font-medium text-gray-600">Hoàn hảo!</p>
                                        <p className="text-sm mt-1">Không có lịch hẹn nào đang nợ hóa đơn thanh toán.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {!loading && appointmentsToPay.length > 0 && pagination.total_pages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50 rounded-b-xl">
                        <div className="text-sm text-gray-500">
                            Hiển thị {(pagination.current_page - 1) * pagination.limit + 1} - {Math.min(pagination.current_page * pagination.limit, pagination.total_items)} trên tổng số <span className="font-medium text-gray-900">{pagination.total_items}</span> bản ghi
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(pagination.current_page - 1)}
                                disabled={pagination.current_page === 1}
                                className="p-2 border border-gray-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed bg-transparent transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="py-2 px-4 text-sm font-medium border border-gray-300 rounded bg-white text-gray-700">
                                Trang {pagination.current_page} / {pagination.total_pages}
                            </span>
                            <button
                                onClick={() => handlePageChange(pagination.current_page + 1)}
                                disabled={pagination.current_page === pagination.total_pages}
                                className="p-2 border border-gray-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed bg-transparent transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </Card>

            {/* --- Danh sách các Modal --- */}

            {/* Modal Chi tiết hóa đơn */}
            <InvoiceDetailModal
                invoice={selectedInvoice}
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                onPaymentClick={handlePayment}
            />

            {/* Modal Tạo hóa đơn */}
            <CreateInvoiceModal
                appointmentData={selectedInvoice} // Truyền dữ liệu cuộc hẹn vào để tự fill form
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={(newInvoice) => {
                    setToast({ show: true, message: 'Tạo hóa đơn thành công!', type: 'success' });
                    fetchData(pagination.current_page); // Tải lại danh sách

                    // Nếu phương thức là Chuyển khoản, tự động mở modal quét mã QR
                    if (newInvoice?.payment_method === 'TRANSFER') {
                        setSelectedInvoice(newInvoice);
                        setIsPaymentModalOpen(true);
                    }
                }}
            />

            {/* Modal Thanh toán qua QR */}
            <PaymentModal
                isOpen={isPaymentModalOpen}
                invoice={selectedInvoice}
                onClose={() => setIsPaymentModalOpen(false)}
                onSuccess={() => {
                    setToast({ show: true, message: 'Thanh toán qua QR đã được xác nhận!', type: 'success' });
                    fetchData(pagination.current_page);
                }}
            />

            {/* Modal Xem chi tiết Treatment */}
            <TreatmentDetailModal
                appointment={selectedAppointmentForTreatment}
                isOpen={isTreatmentModalOpen}
                onClose={() => setIsTreatmentModalOpen(false)}
            />

            {/* Toast Thông báo */}
            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ ...toast, show: false })}
            />
        </div>
    );
};

export default ReceptionistInvoices;