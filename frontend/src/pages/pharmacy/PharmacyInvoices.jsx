import React, { useState, useEffect, useCallback } from 'react';
import {
    Receipt, Search, Loader2, CheckCircle, Clock, XCircle,
    ChevronLeft, ChevronRight, Banknote, QrCode
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import billingService from '../../services/billingService';

const statusConfig = {
    PENDING:   { label: 'Chờ thanh toán', variant: 'warning',  icon: Clock },
    COMPLETED: { label: 'Đã thanh toán',  variant: 'success',  icon: CheckCircle },
    CANCELLED: { label: 'Đã huỷ',         variant: 'danger',   icon: XCircle },
};

const paymentMethodConfig = {
    CASH:     { label: 'Tiền mặt',    icon: Banknote, color: 'text-green-600 bg-green-50' },
    TRANSFER: { label: 'Chuyển khoản', icon: QrCode,   color: 'text-blue-600 bg-blue-50' },
};

const PharmacyInvoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState('');
    const [appliedSearch, setAppliedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [pagination, setPagination] = useState({
        current_page: 1,
        total_pages: 1,
        total_items: 0,
        limit: 10,
    });

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => setAppliedSearch(searchInput), 500);
        return () => clearTimeout(t);
    }, [searchInput]);

    const fetchInvoices = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = { page, limit: pagination.limit };
            if (appliedSearch) params.search = appliedSearch;
            if (statusFilter)  params.status  = statusFilter;

            const res = await billingService.getMedicineInvoices(params);
            const body = res?.data || res;
            setInvoices(body?.data || []);
            if (body?.pagination) {
                setPagination(prev => ({ ...prev, ...body.pagination }));
            }
        } catch (err) {
            console.error('Lỗi tải hóa đơn thuốc:', err);
        } finally {
            setLoading(false);
        }
    }, [appliedSearch, statusFilter, pagination.limit]);

    useEffect(() => {
        fetchInvoices(pagination.current_page);
    }, [appliedSearch, statusFilter]);

    const handlePageChange = (p) => {
        if (p < 1 || p > pagination.total_pages) return;
        setPagination(prev => ({ ...prev, current_page: p }));
        fetchInvoices(p);
    };

    const formatCurrency = (n) =>
        (n || 0).toLocaleString('vi-VN') + 'đ';

    const formatDate = (d) =>
        d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Hóa Đơn Thuốc</h1>
                <p className="text-gray-600 mt-1">Lịch sử hóa đơn tiền thuốc của bệnh nhân</p>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm theo mã hóa đơn, tên bệnh nhân..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                    </div>

                    {/* Status filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="PENDING">Chờ thanh toán</option>
                        <option value="COMPLETED">Đã thanh toán</option>
                        <option value="CANCELLED">Đã huỷ</option>
                    </select>
                </div>
            </Card>

            {/* Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã HĐ</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Bệnh nhân</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Hình thức TT</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-16 text-center">
                                        <Loader2 size={32} className="mx-auto animate-spin text-teal-500 mb-2" />
                                        <p className="text-gray-500 text-sm">Đang tải dữ liệu...</p>
                                    </td>
                                </tr>
                            ) : invoices.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-16 text-center">
                                        <Receipt size={40} className="mx-auto text-gray-300 mb-3" />
                                        <p className="text-gray-500 font-medium">Chưa có hóa đơn thuốc nào</p>
                                        <p className="text-gray-400 text-sm mt-1">Hóa đơn sẽ xuất hiện sau khi dược sĩ xuất thuốc</p>
                                    </td>
                                </tr>
                            ) : (
                                invoices.map((inv) => {
                                    const status = statusConfig[inv.status] || statusConfig.PENDING;
                                    const StatusIcon = status.icon;
                                    const pm = paymentMethodConfig[inv.payment_method] || paymentMethodConfig.CASH;
                                    const PmIcon = pm.icon;

                                    return (
                                        <tr key={inv._id} className="hover:bg-gray-50 transition-colors">
                                            {/* Mã HĐ */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                                                        <Receipt size={16} className="text-teal-600" />
                                                    </div>
                                                    <span className="font-mono font-bold text-gray-800 text-sm">
                                                        {inv.invoice_code || '—'}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Bệnh nhân */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {inv.patient?.profile?.full_name || '—'}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {inv.patient?.profile?.phone || ''}
                                                </p>
                                            </td>

                                            {/* Ngày tạo */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {formatDate(inv.createdAt)}
                                            </td>

                                            {/* Hình thức TT */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${pm.color}`}>
                                                    <PmIcon size={12} />
                                                    {pm.label}
                                                </span>
                                            </td>

                                            {/* Tổng tiền */}
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <span className="text-base font-bold text-teal-700">
                                                    {formatCurrency(inv.total_amount)}
                                                </span>
                                            </td>

                                            {/* Trạng thái */}
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <Badge variant={status.variant}>
                                                    <span className="flex items-center gap-1">
                                                        <StatusIcon size={12} />
                                                        {status.label}
                                                    </span>
                                                </Badge>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && invoices.length > 0 && pagination.total_pages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50 rounded-b-xl">
                        <p className="text-sm text-gray-500">
                            Trang <span className="font-semibold text-gray-800">{pagination.current_page}</span> / {pagination.total_pages}
                            &nbsp;·&nbsp;Tổng <span className="font-semibold text-gray-800">{pagination.total_items}</span> hóa đơn
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(pagination.current_page - 1)}
                                disabled={pagination.current_page === 1}
                                className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => handlePageChange(pagination.current_page + 1)}
                                disabled={pagination.current_page === pagination.total_pages}
                                className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default PharmacyInvoices;
