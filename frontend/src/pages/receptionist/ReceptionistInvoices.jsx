import React, { useState, useEffect } from 'react';
import { DollarSign, Search, FileText, CheckCircle, Clock, Eye, CreditCard, Plus, Loader2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Toast from '../../components/ui/Toast';
import InvoiceDetailModal from './components/modals/InvoiceDetailModal';
import CreateInvoiceModal from './components/modals/CreateInvoiceModal';
import billingService from '../../services/billingService';

const ReceptionistInvoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [stats, setStats] = useState({ totalAmount: 0, paidAmount: 0, pendingAmount: 0 });
    const [loading, setLoading] = useState(false);

    // Filters
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchInput, setSearchInput] = useState('');
    const [appliedSearch, setAppliedSearch] = useState('');

    // Modals & State
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filterStatus !== 'all') params.status = filterStatus;
            if (appliedSearch) params.search = appliedSearch;

            const [listRes, statsRes] = await Promise.all([
                billingService.getAllInvoices(params),
                billingService.getInvoiceStats()
            ]);

            const listData = listRes?.data?.data || listRes?.data || [];
            setInvoices(Array.isArray(listData) ? listData : (listData.invoices || []));

            const statData = statsRes?.data?.data || statsRes?.data || {};
            setStats({
                // Adjust properties based on actual endpoint layout
                totalAmount: statData.totalRevenue || 0,
                paidAmount: statData.totalRevenue || 0, // Since COMPLETED = Paid
                pendingAmount: statData.totalPendingAmount || 0,
            });
        } catch (err) {
            console.error('Lỗi khi tải hóa đơn:', err);
            setToast({ show: true, message: 'Lỗi tải danh sách hóa đơn', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // debounce search
        const timer = setTimeout(() => {
            setAppliedSearch(searchInput);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        fetchData();
    }, [appliedSearch, filterStatus]);

    const handleViewDetails = async (invoice) => {
        try {
            const res = await billingService.getInvoiceById(invoice._id || invoice.id);
            const fullInvoice = res.data?.data || res.data || invoice;
            setSelectedInvoice(fullInvoice);
            setIsDetailModalOpen(true);
        } catch (error) {
            console.error('Lỗi tải chi tiết hóa đơn:', error);
            setToast({ show: true, message: 'Không thể tải chi tiết hóa đơn', type: 'error' });
        }
    };

    const handlePayment = async (invoice) => {
        try {
            await billingService.updateInvoiceStatus(invoice._id, { status: 'COMPLETED', note: 'Thanh toán tiền mặt/chuyển khoản' });
            setToast({ show: true, message: `Thanh toán thành công cho hóa đơn ${invoice.invoice_code || (invoice._id && invoice._id.substring(invoice._id.length - 6).toUpperCase()) || invoice.code}`, type: 'success' });
            fetchData();
            setIsDetailModalOpen(false);
        } catch (error) {
            console.error(error);
            setToast({ show: true, message: error.response?.data?.message || 'Có lỗi xảy ra khi thu tiền.', type: 'error' });
        }
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case 'COMPLETED':
            case 'Paid':
                return 'success';
            case 'PENDING':
            case 'Pending':
                return 'warning';
            case 'CANCELLED':
                return 'danger';
            default: return 'default';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'COMPLETED':
            case 'Paid':
                return 'Đã thanh toán';
            case 'PENDING':
            case 'Pending':
                return 'Chờ thanh toán';
            case 'CANCELLED':
                return 'Đã hủy';
            default: return status;
        }
    };

    const getPatientName = (inv) => {
        return inv.patient?.profile?.full_name || inv.patient_id?.profile_id?.full_name || inv.patientName || 'Khách vãng lai';
    };

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Quản Lý Hóa Đơn</h1>
                    <p className="text-gray-600 mt-1">Theo dõi và thu tiền hóa đơn</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 font-medium"
                >
                    <Plus size={20} />
                    <span>Tạo hóa đơn</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Tổng hóa đơn</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {stats.totalAmount.toLocaleString('vi-VN')}đ
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <FileText size={24} className="text-blue-600" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Đã thu</p>
                            <p className="text-2xl font-bold text-green-600 mt-1">
                                {stats.paidAmount.toLocaleString('vi-VN')}đ
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                            <CheckCircle size={24} className="text-green-600" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Chưa thu / Bị hủy</p>
                            <p className="text-2xl font-bold text-red-600 mt-1">
                                {stats.pendingAmount.toLocaleString('vi-VN')}đ
                            </p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-full">
                            <Clock size={24} className="text-red-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 min-w-[200px]"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="PENDING">Chờ thanh toán</option>
                        <option value="COMPLETED">Đã thanh toán</option>
                        <option value="CANCELLED">Đã hủy</option>
                    </select>
                </div>
            </Card>

            {/* Invoices Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã HĐ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bệnh nhân</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tổng tiền</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
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
                            ) : invoices.length > 0 ? (
                                invoices.map((invoice) => (
                                    <tr key={invoice._id || invoice.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-900" title={invoice._id}>
                                                {invoice.invoice_code || (invoice._id && invoice._id.substring(invoice._id.length - 6).toUpperCase()) || invoice.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900">{getPatientName(invoice)}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-600">
                                                {new Date(invoice.createdAt || invoice.date).toLocaleDateString('vi-VN')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-sm font-medium text-gray-900">
                                                {(invoice.total_amount || invoice.total || 0).toLocaleString('vi-VN')}đ
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <Badge variant={getStatusVariant(invoice.status)}>
                                                {getStatusLabel(invoice.status)}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right flex justify-end gap-2">
                                            <button
                                                onClick={() => handleViewDetails(invoice)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent"
                                                title="Xem chi tiết"
                                            >
                                                <Eye size={20} />
                                            </button>
                                            {invoice.status === 'PENDING' && (
                                                <button
                                                    onClick={() => handlePayment(invoice)}
                                                    className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-1.5 shadow-sm"
                                                >
                                                    <CreditCard size={16} /> Thu tiền
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-gray-500">
                                        Không tìm thấy hóa đơn nào
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Modal Chi tiết hóa đơn */}
            <InvoiceDetailModal
                invoice={selectedInvoice}
                isOpen={isDetailModalOpen}
                onClose={() => {
                    setIsDetailModalOpen(false);
                    setTimeout(() => setSelectedInvoice(null), 300);
                }}
                onPaymentClick={handlePayment}
            />

            {/* Modal Tạo hóa đơn */}
            <CreateInvoiceModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    setToast({ show: true, message: 'Tạo hóa đơn thành công!', type: 'success' });
                    fetchData();
                }}
            />

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
