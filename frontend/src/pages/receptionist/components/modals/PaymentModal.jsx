import React from 'react';
import { X } from 'lucide-react';
import Payment from '../../payment/ReceptionistPayment';

const PaymentModal = ({ isOpen, onClose, invoice, onSuccess }) => {
    if (!isOpen || !invoice) return null;

    const amount = invoice.total_amount || invoice.total || 0;
    const invoiceCode = invoice.invoice_code || (invoice._id && invoice._id.substring(invoice._id.length - 6).toUpperCase()) || invoice.code;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-white/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Thu tiền hóa đơn</h2>
                        <p className="text-xs text-gray-500 font-medium">#{invoiceCode}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-2xl transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    <Payment
                        amount={amount}
                        invoiceCode={invoiceCode}
                        onSuccess={() => {
                            if (onSuccess) onSuccess();
                            // Optional: delay closing to show success state
                            setTimeout(onClose, 2000);
                        }}
                    />
                </div>

                {/* Footer */}
                <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-sm font-bold text-gray-700 hover:bg-white rounded-xl border border-transparent hover:border-gray-200 transition-all"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
