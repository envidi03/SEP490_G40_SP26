import React from 'react';
import { FileText, Eye, CreditCard, DollarSign } from 'lucide-react';
import { getStatusConfig, formatMoney } from '../utils/invoiceUtils';

const InvoiceCard = ({ invoice, onViewDetail, onPay }) => {
    const { label, color, Icon } = getStatusConfig(invoice.status);
    const code = invoice.invoice_code || (invoice._id && invoice._id.slice(-6).toUpperCase());
    const date = new Date(invoice.createdAt || invoice.invoice_date).toLocaleDateString('vi-VN');

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between gap-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                    <FileText size={22} className="text-primary-600" />
                </div>
                <div>
                    <p className="font-semibold text-gray-900">Hóa Đơn {code}</p>
                    <p className="text-sm text-gray-400">{date}</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                    <p className="font-bold text-gray-900">{formatMoney(invoice.total_amount)}</p>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
                        <Icon size={10} />
                        {label}
                    </span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onViewDetail(invoice)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Xem chi tiết"
                    >
                        <Eye size={18} />
                    </button>
                    {invoice.status === 'PENDING' && invoice.payment_method === 'TRANSFER' && (
                        <button
                            onClick={() => onPay(invoice)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            <CreditCard size={15} />
                            QR
                        </button>
                    )}
                    {invoice.status === 'PENDING' && invoice.payment_method === 'CASH' && (
                        <span className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-600 text-sm font-medium rounded-lg border border-amber-200" title="Thanh toán tại quầy">
                            <DollarSign size={15} />
                            Tiền mặt
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InvoiceCard;
