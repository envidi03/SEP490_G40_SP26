import { X, Printer, Download, CreditCard, Clock, CheckCircle } from 'lucide-react';
import Badge from '../../../../components/ui/Badge';
import { formatDate } from '../../../../utils/dateUtils';

const InvoiceDetailModal = ({ invoice, isOpen, onClose, onPaymentClick }) => {
    if (!isOpen || !invoice) return null;

    const displayItems = invoice.items || [];
    const totalAmount = invoice.total_amount || invoice.total || 0;

    // For pending invoices, paid amount is 0.
    const paidAmount = invoice.status === 'COMPLETED' ? totalAmount : (invoice.paid || 0);
    const invoiceCode = invoice.invoice_code || (invoice._id && invoice._id.substring(invoice._id.length - 6).toUpperCase()) || invoice.code;
    const createdAt = invoice.createdAt || invoice.invoice_date || invoice.date;
    const patientName = invoice.patient?.profile?.full_name || invoice.patient_id?.profile_id?.full_name || invoice.patientName || 'Khách vãng lai';
    const patientCode = invoice.patient?.patient_code || invoice.patient_id?.patient_code || '';

    const getStatusInfo = (status) => {
        switch (status) {
            case 'Paid':
                return { label: 'Đã thanh toán', variant: 'success', icon: CheckCircle };
            case 'Pending':
                return { label: 'Chưa thanh toán', variant: 'danger', icon: Clock };
            case 'Partial':
                return { label: 'Thanh toán 1 phần', variant: 'warning', icon: CreditCard };
            default:
                return { label: status, variant: 'default', icon: Clock };
        }
    };

    const statusInfo = getStatusInfo(invoice.status);
    const StatusIcon = statusInfo.icon;
    const remainingAmount = totalAmount - paidAmount;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] max-w-3xl w-full mx-4 overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Chi tiết hóa đơn</h2>
                        <p className="text-sm text-gray-500 font-medium">#{invoiceCode}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge variant={statusInfo.variant} className="px-3 py-1">
                            <StatusIcon size={14} className="inline mr-1.5" />
                            {statusInfo.label}
                        </Badge>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    {/* Patient & Invoice Info Card */}
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 mb-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Thông tin khách hàng</p>
                                <p className="font-bold text-gray-900 text-lg">
                                    {patientName}
                                    {patientCode && <span className="ml-2 text-sm font-normal text-gray-500 font-mono">({patientCode})</span>}
                                </p>
                                {/* We can add phone/email here if available in the future */}
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500 mb-1">Ngày lập hóa đơn</p>
                                <p className="font-semibold text-gray-900">{formatDate(createdAt)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Service Items Table */}
                    <h3 className="font-bold text-gray-900 mb-4 px-1">Chi tiết dịch vụ</h3>
                    <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 text-sm">
                                    <th className="px-4 py-3 font-medium">STT</th>
                                    <th className="px-4 py-3 font-medium">Dịch vụ</th>
                                    <th className="px-4 py-3 font-medium text-right">Đơn giá</th>
                                    <th className="px-4 py-3 font-medium text-center">SL</th>
                                    <th className="px-4 py-3 font-medium text-right">Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {displayItems.map((item, index) => {
                                    const itemName = item.service_name || item.service_id?.service_name || item.name;
                                    const itemPrice = item.unit_price || item.service_id?.price || item.price || 0;
                                    const itemTotal = item.amount || item.total || (itemPrice * (item.quantity || 1));

                                    return (
                                        <tr key={item._id || item.id || index} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{itemName}</td>
                                            <td className="px-4 py-3 text-sm text-gray-600 text-right">{itemPrice.toLocaleString('vi-VN')}đ</td>
                                            <td className="px-4 py-3 text-sm text-gray-600 text-center">{item.quantity}</td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{itemTotal.toLocaleString('vi-VN')}đ</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary */}
                    <div className="flex justify-end">
                        <div className="w-full max-w-sm space-y-3 bg-gray-50 p-5 rounded-xl border border-gray-100">
                            <div className="flex justify-between items-center text-sm text-gray-600">
                                <span>Tổng cộng:</span>
                                <span className="font-medium text-gray-900">{totalAmount.toLocaleString('vi-VN')}đ</span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-gray-600">
                                <span>Đã thanh toán:</span>
                                <span className="font-medium text-green-600">{paidAmount.toLocaleString('vi-VN')}đ</span>
                            </div>
                            <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                                <span className="font-bold text-gray-900">Còn lại:</span>
                                <span className={`text-xl font-bold ${remainingAmount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                    {remainingAmount.toLocaleString('vi-VN')}đ
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <div className="flex gap-2">
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2">
                            <Printer size={18} />
                            In Hóa Đơn
                        </button>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2">
                            <Download size={18} />
                            Tải PDF
                        </button>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-white transition-colors"
                        >
                            Đóng
                        </button>
                        {invoice.status === 'PENDING' && (
                            <button
                                onClick={() => {
                                    onClose();
                                    if (onPaymentClick) onPaymentClick(invoice);
                                }}
                                className="px-6 py-2 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 flex items-center gap-2 transition-colors shadow-sm"
                            >
                                <CreditCard size={18} />
                                Thu tiền ngay
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default InvoiceDetailModal;
