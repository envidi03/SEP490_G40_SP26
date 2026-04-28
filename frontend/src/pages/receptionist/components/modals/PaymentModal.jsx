import React, { useState } from 'react';
import { X, Banknote, QrCode, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import Payment from '../../payment/ReceptionistPayment';
import billingService from '../../../../services/billingService';

const PaymentModal = ({ isOpen, onClose, invoice, onSuccess }) => {
    // 'select' | 'cash' | 'sepay'
    const [step, setStep] = useState('select');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDone, setIsDone] = useState(false);
    const [error, setError] = useState(null);

    const amount = invoice?.total_amount || invoice?.total || 0;
    const invoiceCode =
        invoice?.invoice_code ||
        (invoice?._id && invoice._id.substring(invoice._id.length - 6).toUpperCase()) ||
        invoice?.code;

    // Reset về bước đầu khi modal mở
    React.useEffect(() => {
        if (isOpen) {
            setStep('select');
            setIsDone(false);
            setError(null);
            setIsProcessing(false);
        }
    }, [isOpen]);

    if (!isOpen || !invoice) return null;

    // --- Handler thanh toán tiền mặt ---
    const handleCashPayment = async () => {
        setIsProcessing(true);
        setError(null);
        try {
            await billingService.updateInvoiceStatus(invoice._id || invoice.id, {
                status: 'COMPLETED',
                payment_method: 'CASH',
                note: 'Thanh toán tiền mặt tại quầy',
            });
            setIsDone(true);
            if (onSuccess) onSuccess();
            setTimeout(() => onClose(), 1800);
        } catch (err) {
            setError(err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 fade-in duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/70">
                    <div className="flex items-center gap-3">
                        {step !== 'select' && !isDone && (
                            <button
                                onClick={() => { setStep('select'); setError(null); }}
                                className="text-gray-400 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-xl transition-all"
                            >
                                <ArrowLeft size={18} />
                            </button>
                        )}
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Thu tiền hóa đơn</h2>
                            <p className="text-xs text-gray-500 font-medium">#{invoiceCode}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-2xl transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">

                    {/* BƯỚC 1: Chọn hình thức thanh toán */}
                    {step === 'select' && (
                        <div>
                            <p className="text-sm text-gray-500 mb-6 text-center">
                                Vui lòng chọn hình thức thanh toán cho hóa đơn&nbsp;
                                <span className="font-bold text-gray-800">{amount.toLocaleString('vi-VN')}đ</span>
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Tiền mặt */}
                                <button
                                    onClick={() => setStep('cash')}
                                    className="group flex flex-col items-center gap-4 p-6 rounded-2xl border-2 border-gray-200 hover:border-green-400 hover:bg-green-50 transition-all duration-200"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-green-100 group-hover:bg-green-200 flex items-center justify-center transition-colors">
                                        <Banknote size={32} className="text-green-600" />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold text-gray-800 text-base">Tiền mặt</p>
                                        <p className="text-xs text-gray-500 mt-1">Thu tiền trực tiếp</p>
                                    </div>
                                </button>

                                {/* SePay / QR */}
                                <button
                                    onClick={() => setStep('sepay')}
                                    className="group flex flex-col items-center gap-4 p-6 rounded-2xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
                                        <QrCode size={32} className="text-blue-600" />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold text-gray-800 text-base">SePay / QR</p>
                                        <p className="text-xs text-gray-500 mt-1">Chuyển khoản tự động</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* BƯỚC 2A: Tiền mặt — xác nhận */}
                    {step === 'cash' && (
                        <div className="flex flex-col items-center gap-5">
                            {isDone ? (
                                <div className="py-6 flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-300">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                                        <CheckCircle size={48} className="text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Thanh toán thành công!</h3>
                                    <p className="text-sm text-gray-500 text-center">
                                        Đã ghi nhận thanh toán tiền mặt cho hóa đơn {invoiceCode}.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                                        <Banknote size={40} className="text-green-600" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm text-gray-500">Số tiền cần thu</p>
                                        <p className="text-4xl font-black text-green-600 mt-1">
                                            {amount.toLocaleString('vi-VN')}
                                            <span className="text-xl ml-1 font-bold text-gray-400">đ</span>
                                        </p>
                                    </div>
                                    <div className="w-full p-4 bg-amber-50 border border-amber-200 rounded-2xl text-center">
                                        <p className="text-sm text-amber-800 font-medium">
                                            Xác nhận đã nhận đủ tiền mặt từ bệnh nhân?
                                        </p>
                                        <p className="text-xs text-amber-600 mt-1">
                                            Hành động này sẽ cập nhật hóa đơn thành <strong>Đã thanh toán</strong>
                                        </p>
                                    </div>
                                    {error && (
                                        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 w-full text-center">
                                            {error}
                                        </p>
                                    )}
                                    <button
                                        onClick={handleCashPayment}
                                        disabled={isProcessing}
                                        className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {isProcessing
                                            ? <><Loader2 size={20} className="animate-spin" /> Đang xử lý...</>
                                            : <><CheckCircle size={20} /> Xác nhận đã nhận tiền</>
                                        }
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {/* BƯỚC 2B: SePay — QR */}
                    {step === 'sepay' && (
                        <Payment
                            amount={amount}
                            invoiceCode={invoiceCode}
                            autoPoll={true}
                            onSuccess={() => {
                                if (onSuccess) onSuccess();
                                setTimeout(() => onClose(), 2000);
                            }}
                        />
                    )}
                </div>

                {/* Footer */}
                {step !== 'sepay' && !isDone && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-white rounded-xl border border-transparent hover:border-gray-200 transition-all"
                        >
                            Đóng
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentModal;
