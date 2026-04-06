import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import billingService from '../../../../services/billingService';
import { formatMoney } from '../../utils/invoiceUtils';

const QRPaymentModal = ({ invoice, onClose, onPaid }) => {
    const [checking, setChecking] = useState(false);
    const [paid, setPaid] = useState(false);

    const checkStatus = async () => {
        if (!invoice?.invoice_code) return;
        setChecking(true);
        try {
            const res = await billingService.checkPaymentStatus(invoice.invoice_code);
            // Backend trả về { status: 'PAID' } khi thanh toán thành công
            const status = res?.data?.status || res?.data?.data?.status;
            if (status === 'PAID' || status === 'COMPLETED') {
                setPaid(true);
                if (onPaid) onPaid(); // Thông báo cho component cha
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

export default QRPaymentModal;
