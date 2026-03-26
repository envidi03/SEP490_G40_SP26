import React from 'react';
import { CreditCard } from 'lucide-react';
import { getStatusConfig, formatMoney } from '../../utils/invoiceUtils';

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

export default InvoiceDetailModal;
