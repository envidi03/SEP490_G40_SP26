import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import Toast from '../../components/ui/Toast';
import SharedPagination from '../../components/ui/SharedPagination';
import { getProfile } from '../../services/profileService';
import billingService from '../../services/billingService';
import {
    ArrowLeft, FileText, Loader2, Receipt, CheckCircle, Clock, XCircle,
    Eye, CreditCard, DollarSign, ChevronDown, ChevronUp
} from 'lucide-react';

/* ─── Helper functions ─────────────────────────────────────────── */
const getStatusConfig = (status) => {
    switch (status) {
        case 'COMPLETED':
            return { label: 'Đã thanh toán', color: 'bg-green-100 text-green-700 border-green-200', Icon: CheckCircle };
        case 'PENDING':
            return { label: 'Chờ thanh toán', color: 'bg-amber-100 text-amber-700 border-amber-200', Icon: Clock };
        case 'CANCELLED':
            return { label: 'Đã hủy', color: 'bg-red-100 text-red-700 border-red-200', Icon: XCircle };
        default:
            return { label: status, color: 'bg-gray-100 text-gray-700 border-gray-200', Icon: FileText };
    }
};

const formatMoney = (amount) =>
    amount != null ? amount.toLocaleString('vi-VN') + 'đ' : '—';

/* ─── Detail Modal ─────────────────────────────────────────────── */
const InvoiceDetailModal = ({ invoice, onClose, onPay }) => {
    if (!invoice) return null;
    const { label, color, Icon } = getStatusConfig(invoice.status);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-600 to-blue-600 p-6 rounded-t-2xl">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-white/70 text-sm">Mã hóa đơn</p>
                            <h2 className="text-white text-xl font-bold">{invoice.invoice_code || invoice._id?.slice(-6).toUpperCase()}</h2>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 bg-white ${color}`}>
                            <Icon size={12} />
                            {label}
                        </span>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    {/* Date */}
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Ngày tạo</span>
                        <span className="font-medium text-gray-900">
                            {new Date(invoice.createdAt || invoice.invoice_date).toLocaleDateString('vi-VN', {
                                day: '2-digit', month: 'long', year: 'numeric'
                            })}
                        </span>
                    </div>

                    {/* Payment method */}
                    {invoice.payment_method && (
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Phương thức</span>
                            <span className="font-medium text-gray-900">
                                {invoice.payment_method === 'TRANSFER' ? 'Chuyển khoản' : 'Tiền mặt'}
                            </span>
                        </div>
                    )}

                    {/* Service items */}
                    {invoice.items && invoice.items.length > 0 && (
                        <div className="border border-gray-100 rounded-xl overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Chi tiết dịch vụ
                            </div>
                            <div className="divide-y divide-gray-100">
                                {invoice.items.map((item, idx) => (
                                    <div key={idx} className="px-4 py-3 flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{item.service_name || 'Dịch vụ'}</p>
                                            {item.sub_service_name && (
                                                <p className="text-xs text-gray-500">{item.sub_service_name}</p>
                                            )}
                                            <p className="text-xs text-gray-400">SL: {item.quantity || 1}</p>
                                        </div>
                                        <p className="text-sm font-semibold text-primary-700">{formatMoney(item.amount)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Total */}
                    <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-4 flex justify-between items-center">
                        <span className="font-semibold text-gray-900">Tổng cộng</span>
                        <span className="text-xl font-bold text-primary-700">{formatMoney(invoice.total_amount)}</span>
                    </div>

                    {/* Note */}
                    {invoice.note && (
                        <p className="text-sm text-gray-500 italic border-l-4 border-gray-200 pl-3">{invoice.note}</p>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 pt-0 flex gap-3">
                    {invoice.status === 'PENDING' && invoice.payment_method === 'TRANSFER' && (
                        <button
                            onClick={() => onPay(invoice)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
                        >
                            <CreditCard size={18} />
                            Thanh toán QR
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ─── QR Payment Modal ─────────────────────────────────────────── */
const QRPaymentModal = ({ invoice, onClose }) => {
    const [checking, setChecking] = useState(false);
    const [paid, setPaid] = useState(false);

    const checkStatus = async () => {
        if (!invoice?.invoice_code) return;
        setChecking(true);
        try {
            const res = await billingService.checkPaymentStatus(invoice.invoice_code);
            if (res?.data?.data?.status === 'COMPLETED' || res?.data?.status === 'COMPLETED') {
                setPaid(true);
            }
        } catch {
            // ignore
        } finally {
            setChecking(false);
        }
    };

    if (!invoice) return null;

    const amount = invoice.total_amount || 0;
    const bin = '970422'; // Techcombank as default
    const accountNo = '19036498712019';
    const addInfo = (invoice.invoice_code || invoice._id?.slice(-6)).replace(/\s/g, '');
    const qrUrl = `https://img.vietqr.io/image/${bin}-${accountNo}-compact2.png?amount=${amount}&addInfo=${addInfo}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
                <h2 className="text-xl font-bold text-gray-900">Quét mã QR để thanh toán</h2>
                <p className="text-gray-500 text-sm">HĐ: <span className="font-semibold text-gray-800">{invoice.invoice_code}</span></p>
                <p className="text-2xl font-bold text-primary-700">{formatMoney(amount)}</p>
                {paid ? (
                    <div className="flex flex-col items-center gap-2 py-4">
                        <CheckCircle size={48} className="text-green-500" />
                        <p className="text-green-700 font-semibold">Đã thanh toán thành công!</p>
                    </div>
                ) : (
                    <>
                        <img src={qrUrl} alt="QR Code" className="mx-auto w-56 h-56 rounded-xl border" />
                        <button
                            onClick={checkStatus}
                            disabled={checking}
                            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors text-sm"
                        >
                            {checking ? 'Đang kiểm tra...' : 'Tôi đã chuyển khoản rồi'}
                        </button>
                    </>
                )}
                <button onClick={onClose} className="w-full py-2.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                    Đóng
                </button>
            </div>
        </div>
    );
};

/* ─── Main Page ─────────────────────────────────────────────────── */
const PatientInvoices = () => {
    const navigate = useNavigate();
    const [patientId, setPatientId] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const pageSize = 8;

    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [toast, setToast] = useState({ show: false, type: 'success', message: '' });

    // Get patient_id from profile
    useEffect(() => {
        setLoading(true);
        getProfile()
            .then(res => {
                const pid = res?.data?.patient_id;
                if (pid) {
                    setPatientId(pid);
                } else {
                    console.error('Không tìm thấy patient_id trong profile');
                    setToast({ show: true, type: 'error', message: 'Tài khoản của bạn không có thông tin bệnh nhân!' });
                    setLoading(false);
                }
            })
            .catch(err => {
                console.error('Lỗi lấy profile:', err);
                setToast({ show: true, type: 'error', message: 'Không thể xác thực thông tin người dùng!' });
                setLoading(false);
            });
    }, []);

    const fetchInvoices = useCallback(async (page = 1) => {
        if (!patientId) return;
        setLoading(true);
        try {
            const params = { page, limit: pageSize };
            if (statusFilter !== 'all') params.status = statusFilter;
            const res = await billingService.getPatientInvoices(patientId, params);
            
            // Log for debugging
            console.log('Original API response:', res);
            console.log('Extracted res.data:', res?.data);

            // Xử lý dữ liệu linh hoạt dựa trên cấu trúc backend trả về
            let list = [];
            let pagination = {};

            if (Array.isArray(res?.data)) {
                // Trường hợp res.data là mảng trực tiếp
                list = res.data;
                pagination = res.pagination || {};
            } else if (Array.isArray(res)) {
                // Trường hợp bản thân res là mảng (nếu interceptor đã unwrap)
                list = res;
            } else if (res?.data?.data && Array.isArray(res.data.data)) {
                // Trường hợp lồng nhau { data: { data: [...] } }
                list = res.data.data;
                pagination = res.data.pagination || {};
            } else {
                // Mặc định
                list = res?.data || [];
                pagination = res?.pagination || {};
            }

            setInvoices(list);
            setTotalItems(pagination.totalItems || list.length);
            setTotalPages(pagination.totalPages || Math.ceil((pagination.totalItems || list.length) / pageSize) || 1);
            setCurrentPage(page);
        } catch (err) {
            console.error('Lỗi tải hóa đơn:', err);
            setToast({ show: true, type: 'error', message: 'Không thể tải danh sách hóa đơn!' });
        } finally {
            setLoading(false);
        }
    }, [patientId, statusFilter]);

    useEffect(() => {
        fetchInvoices(1);
    }, [fetchInvoices]);

    const handleViewDetail = async (invoice) => {
        try {
            const res = await billingService.getInvoiceById(invoice._id || invoice.id);
            setSelectedInvoice(res?.data?.data || res?.data || invoice);
        } catch {
            setSelectedInvoice(invoice);
        }
        setShowDetail(true);
    };

    const handlePay = (invoice) => {
        setShowDetail(false);
        setSelectedInvoice(invoice);
        setShowQR(true);
    };

    // Stats summary
    const pendingCount = invoices.filter(i => i.status === 'PENDING').length;
    const completedCount = invoices.filter(i => i.status === 'COMPLETED').length;

    return (
        <PublicLayout>
            <div className="min-h-[calc(100vh-160px)] bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Back */}
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-200" />
                        <span className="font-medium">Quay lại</span>
                    </button>

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Hóa đơn của tôi</h1>
                        <p className="text-gray-600">Xem lịch sử thanh toán và quản lý hóa đơn</p>
                    </div>

                    {/* Summary cards */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                <Clock size={24} className="text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
                                <p className="text-sm text-gray-500">Chờ thanh toán</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <CheckCircle size={24} className="text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
                                <p className="text-sm text-gray-500">Đã thanh toán</p>
                            </div>
                        </div>
                    </div>

                    {/* Filter */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex gap-2 flex-wrap">
                        {[
                            { value: 'all', label: 'Tất cả' },
                            { value: 'PENDING', label: 'Chờ thanh toán' },
                            { value: 'COMPLETED', label: 'Đã thanh toán' },
                            { value: 'CANCELLED', label: 'Đã hủy' },
                        ].map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => setStatusFilter(opt.value)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${statusFilter === opt.value
                                    ? 'bg-primary-600 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 size={40} className="animate-spin text-primary-500" />
                            <span className="ml-3 text-gray-500 text-lg">Đang tải hóa đơn...</span>
                        </div>
                    ) : invoices.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                            <Receipt size={64} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có hóa đơn nào</h3>
                            <p className="text-gray-500">Các hóa đơn khám chữa bệnh sẽ xuất hiện ở đây.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {invoices.map((inv) => {
                                const { label, color, Icon } = getStatusConfig(inv.status);
                                const code = inv.invoice_code || (inv._id && inv._id.slice(-6).toUpperCase());
                                const date = new Date(inv.createdAt || inv.invoice_date).toLocaleDateString('vi-VN');
                                return (
                                    <div
                                        key={inv._id || inv.id}
                                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between gap-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                                                <FileText size={22} className="text-primary-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">HĐ #{code}</p>
                                                <p className="text-sm text-gray-400">{date}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right hidden sm:block">
                                                <p className="font-bold text-gray-900">{formatMoney(inv.total_amount)}</p>
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
                                                    <Icon size={10} />
                                                    {label}
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleViewDetail(inv)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                {inv.status === 'PENDING' && inv.payment_method === 'TRANSFER' && (
                                                    <button
                                                        onClick={() => { setSelectedInvoice(inv); setShowQR(true); }}
                                                        className="flex items-center gap-1.5 px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                                                    >
                                                        <CreditCard size={15} />
                                                        QR
                                                    </button>
                                                )}
                                                {inv.status === 'PENDING' && inv.payment_method === 'CASH' && (
                                                    <span className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-600 text-sm font-medium rounded-lg border border-amber-200">
                                                        <DollarSign size={15} />
                                                        Tiền mặt
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <SharedPagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={totalItems}
                                onPageChange={(p) => fetchInvoices(p)}
                                itemLabel="hóa đơn"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showDetail && (
                <InvoiceDetailModal
                    invoice={selectedInvoice}
                    onClose={() => setShowDetail(false)}
                    onPay={handlePay}
                />
            )}
            {showQR && (
                <QRPaymentModal
                    invoice={selectedInvoice}
                    onClose={() => { setShowQR(false); fetchInvoices(currentPage); }}
                />
            )}

            {toast.show && (
                <Toast
                    show={toast.show}
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast({ ...toast, show: false })}
                    duration={3000}
                />
            )}
        </PublicLayout>
    );
};

export default PatientInvoices;
