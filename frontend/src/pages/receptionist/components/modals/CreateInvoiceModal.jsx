import React, { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';
import billingService from '../../../../services/billingService';

const CreateInvoiceModal = ({ isOpen, onClose, onSuccess, appointmentData }) => {
    console.log('CreateInvoiceModal received appointmentData:', appointmentData);
    // Trạng thái của Modal: 'IDLE' | 'CREATING' | 'SUCCESS' | 'ERROR'
    const [status, setStatus] = useState('IDLE');
    const [createdInvoice, setCreatedInvoice] = useState(null);
    const [error, setError] = useState(null);

    // Thông tin tài khoản ngân hàng của Phòng khám (Bạn tự thay đổi phần này)
    const BANK_BIN = 'MB'; // Tên viết tắt hoặc BIN của ngân hàng (VD: MB, VCB, TCB)
    const BANK_ACCOUNT = '0123456789'; // Số tài khoản
    const ACCOUNT_NAME = 'NHA KHOA CLINIC'; // Tên chủ tài khoản

    const autoCreateInvoice = async () => {
        setStatus('CREATING');
        setError(null);

        try {
            const payload = {
                patient_id: appointmentData.patient_id,
                appointment_id: appointmentData._id,
                items: appointmentData.treatments_to_pay?.map(t => {
                    const fallbackServiceId = appointmentData.book_service?.[0]?.service_id;
                    const fallbackSubServiceId = appointmentData.book_service?.[0]?.sub_service_id;

                    return {
                        service_id: t.service_id || fallbackServiceId, 
                        sub_service_id: t.sub_service_id || fallbackSubServiceId || null,
                        quantity: t.quantity || 1,
                        price: t.price || 0 
                    };
                }) || [],
                note: 'Tự động tạo hóa đơn chuyển khoản (QR)',
                payment_method: 'TRANSFER'
            };

            const response = await billingService.createInvoice(payload);
            const newInvoice = response?.data?.data || response?.data;

            setCreatedInvoice(newInvoice);
            setStatus('SUCCESS');

            if (onSuccess) onSuccess(newInvoice);

        } catch (err) {
            console.error('Error auto-creating invoice:', err);
            setError(err.response?.data?.message || 'Không thể tự động tạo hóa đơn. Vui lòng thử lại.');
            setStatus('ERROR');
        }
    };

    useEffect(() => {
        // Kích hoạt tự động tạo hóa đơn khi Modal mở và có dữ liệu
        if (isOpen && appointmentData && status === 'IDLE') {
            autoCreateInvoice();
        }

        if (!isOpen) {
            setStatus('IDLE');
            setCreatedInvoice(null);
            setError(null);
        }
    }, [isOpen, appointmentData]);

    

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={status !== 'CREATING' ? onClose : undefined}></div>
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col transform transition-all">

                {/* --- TRẠNG THÁI 1: ĐANG TẠO HÓA ĐƠN --- */}
                {status === 'CREATING' && (
                    <div className="p-10 flex flex-col items-center justify-center text-center">
                        <Loader2 size={48} className="text-primary-500 animate-spin mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Đang khởi tạo hóa đơn...</h3>
                        <p className="text-sm text-gray-500">Vui lòng đợi trong giây lát, hệ thống đang xử lý dữ liệu.</p>
                    </div>
                )}

                {/* --- TRẠNG THÁI 2: LỖI TẠO HÓA ĐƠN --- */}
                {status === 'ERROR' && (
                    <div className="p-8 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle size={32} className="text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Khởi tạo thất bại</h3>
                        <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg mb-6 border border-red-100">
                            {error}
                        </p>
                        <button
                            onClick={onClose}
                            className="w-full py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Đóng lại
                        </button>
                    </div>
                )}

                {/* --- TRẠNG THÁI 3: THÀNH CÔNG -> HIỂN THỊ MÃ QR --- */}
                {status === 'SUCCESS' && createdInvoice && (
                    <>
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div className="flex items-center gap-2">
                                <CreditCard className="text-primary-600" size={20} />
                                <h2 className="text-base font-bold text-gray-900">Mã QR Thanh Toán</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 flex flex-col items-center">
                            <div className="text-center mb-6 w-full">
                                <p className="text-sm text-gray-500 mb-1">
                                    Khách hàng: <span className="font-medium text-gray-900">{appointmentData?.full_name || 'Khách vãng lai'}</span>
                                </p>
                                <p className="text-2xl font-bold text-primary-600">
                                    {/* Đảm bảo luôn trả ra một số (Number) trước khi gọi .toLocaleString() */}
                                    {(createdInvoice?.total_amount ?? appointmentData?.total_payment_amount ?? 0).toLocaleString('vi-VN')}đ
                                </p>
                                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200">
                                    <CheckCircle size={14} /> Mã HĐ: {createdInvoice?.invoice_code || 'Mới'}
                                </div>
                            </div>

                            {/* Khối hiển thị mã QR VietQR */}
                            <div className="p-3 bg-white border-2 border-dashed border-gray-200 rounded-2xl mb-6">
                                <img
                                    src={`https://img.vietqr.io/image/${BANK_BIN}-${BANK_ACCOUNT}-compact2.png?amount=${createdInvoice.total_amount || appointmentData?.total_payment_amount}&addInfo=${createdInvoice.invoice_code || 'Thanh toan nha khoa'}&accountName=${ACCOUNT_NAME}`}
                                    alt="Mã QR Thanh Toán"
                                    className="w-48 h-48 object-contain"
                                />
                            </div>

                            <div className="w-full text-center text-xs text-gray-500 mb-6 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                Mở ứng dụng ngân hàng và quét mã QR để thanh toán tự động với đúng số tiền.
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors shadow-sm"
                            >
                                Đã thanh toán xong
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CreateInvoiceModal;