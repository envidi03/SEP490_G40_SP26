import React from 'react';
import { X, DollarSign, CreditCard } from 'lucide-react';

const PaymentMethodModal = ({ isOpen, onClose, onSelect, invoice }) => {
    if (!isOpen) return null;

    const invoiceCode = invoice?.invoice_code || (invoice?._id && invoice._id.substring(invoice._id.length - 6).toUpperCase()) || 'Hóa đơn';
    const totalAmount = invoice?.total_amount || 0;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Chọn phương thức</h3>
                        <p className="text-sm font-bold text-slate-500 mt-0.5">#{invoiceCode} - {totalAmount.toLocaleString('vi-VN')}đ</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-all">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    <button
                        onClick={() => onSelect('CASH')}
                        className="w-full p-6 bg-white border-2 border-slate-100 rounded-2xl flex items-center gap-5 hover:border-green-500 hover:bg-green-50 transition-all group group-active:scale-[0.98]"
                    >
                        <div className="p-4 bg-green-100 text-green-600 rounded-2xl group-hover:bg-green-600 group-hover:text-white transition-colors">
                            <DollarSign size={28} strokeWidth={2.5} />
                        </div>
                        <div className="text-left">
                            <h4 className="font-black text-slate-800 text-lg uppercase tracking-tight">Tiền mặt</h4>
                            <p className="text-sm font-bold text-slate-500">Khách trả tiền mặt tại quầy</p>
                        </div>
                    </button>

                    <button
                        onClick={() => onSelect('TRANSFER')}
                        className="w-full p-6 bg-white border-2 border-slate-100 rounded-2xl flex items-center gap-5 hover:border-blue-500 hover:bg-blue-50 transition-all group group-active:scale-[0.98]"
                    >
                        <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <CreditCard size={28} strokeWidth={2.5} />
                        </div>
                        <div className="text-left">
                            <h4 className="font-black text-slate-800 text-lg uppercase tracking-tight">Chuyển khoản / QR</h4>
                            <p className="text-sm font-bold text-slate-500">Quét mã VietQR (Tự động)</p>
                        </div>
                    </button>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 flex justify-center">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 text-sm font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentMethodModal;
