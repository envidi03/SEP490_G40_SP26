import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Payment from '../../payment/ReceptionistPayment';
import billingService from '../../../../services/billingService';

const PaymentModal = ({ isOpen, onClose, invoice, onSuccess, autoPoll = true }) => {
    const [isPaid, setIsPaid] = useState(false);

    // Parse thông tin invoice
    const amount = invoice?.total_amount || invoice?.total || 0;
    const invoiceCode = invoice?.invoice_code || (invoice?._id && invoice._id.substring(invoice._id.length - 6).toUpperCase()) || invoice?.code;

    // KỸ THUẬT: Lưu lại props của lần render trước để so sánh
    const [prevTracked, setPrevTracked] = useState({ isOpen: false, invoiceCode: null });

    // Cập nhật state trực tiếp trong lúc render nếu props thay đổi (không dùng useEffect)
    if (isOpen !== prevTracked.isOpen || invoiceCode !== prevTracked.invoiceCode) {
        setPrevTracked({ isOpen, invoiceCode });
        if (isOpen) {
            setIsPaid(false); // Chỉ reset về false khi modal được mở lên
        }
    }

    useEffect(() => {
        if (isPaid || !autoPoll || !invoiceCode || !isOpen) return;

        const interval = setInterval(async () => {
            try {
                const response = await billingService.checkPaymentStatus(invoiceCode);
                const status = response?.status || response?.data?.status;
                
                if (status === "PAID") {
                    setIsPaid(true);
                    if (onSuccess) onSuccess();
                    clearInterval(interval);
                    
                    // Delay logic
                    setTimeout(() => {
                        // Thêm check isOpen để tránh gọi onClose nếu modal đã bị đóng bởi user
                        onClose();
                    }, 2000);
                }
            } catch (error) {
                console.error("Error checking payment status:", error);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [isPaid, autoPoll, invoiceCode, onSuccess, isOpen, onClose]);

    if (!isOpen || !invoice) return null;

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
                        isPaid={isPaid}
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