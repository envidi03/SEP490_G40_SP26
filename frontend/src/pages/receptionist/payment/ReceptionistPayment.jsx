import React, { useState, useEffect } from "react";
import billingService from "../../../services/billingService";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";

const Payment = ({
  amount = 0,
  invoiceCode,
  onSuccess,
  autoPoll = true
}) => {
  const bankId = import.meta.env.VITE_BANK_ID || "BIDV";
  const accountNo = import.meta.env.VITE_BANK_ACCOUNT || "96247TOANTTHE172722";
  const accountName = import.meta.env.VITE_ACCOUNT_NAME || "TRAN TRUNG TOAN";

  const [isPaid, setIsPaid] = useState(false);
  const [error, setError] = useState(null);

  const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${invoiceCode}&accountName=${accountName}`;

  useEffect(() => {
    if (isPaid || !autoPoll || !invoiceCode) return;

    const interval = setInterval(async () => {
      try {
        const response = await billingService.checkPaymentStatus(invoiceCode);

        // Assuming backend returns status in response.data or response directly depending on interceptor
        // Based on common patterns in this project, response.data.status might be mapped to response.status
        const status = response?.status || response?.data?.status;

        if (status === "PAID") {
          setIsPaid(true);
          if (onSuccess) onSuccess();
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
        // Don't stop polling on error unless it's critical
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaid, autoPoll, invoiceCode, onSuccess]);

  return (
    <div className="p-2">
      {isPaid ? (
        <div className="py-8 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={48} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h2>
          <p className="text-gray-600">Hệ thống đã ghi nhận thanh toán cho hóa đơn {invoiceCode}.</p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-8 items-stretch pt-2">
          {/* Left: QR Code Side */}
          <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl p-6 border border-gray-100">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                <img
                  src={qrUrl}
                  alt="QR Code"
                  className="w-[240px] h-[240px] object-contain rounded-lg"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 py-2.5 px-4 bg-amber-50 rounded-xl border border-amber-100 text-amber-700 w-full justify-center">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-xs font-bold uppercase tracking-wider">Đang chờ quét mã...</span>
            </div>
          </div>

          {/* Right: Information Side */}
          <div className="flex-1 flex flex-col justify-between py-2">
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900 mb-1">Thanh toán</h2>
                <p className="text-sm text-gray-500 font-medium">Sử dụng ứng dụng Ngân hàng hoặc Ví điện tử để quét mã đối diện</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Số tiền cần trả</span>
                  <span className="font-black text-primary-600 text-3xl">
                    {amount.toLocaleString('vi-VN')}
                    <span className="text-lg ml-1 text-primary-400 font-bold text-gray-400 uppercase tracking-widest">đ</span>
                  </span>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nội dung chuyển khoản</span>
                  <span className="font-mono font-black text-gray-800 text-xl tracking-wider select-all">{invoiceCode}</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 text-red-600 text-sm p-3 bg-red-50 rounded-xl border border-red-100">
                <AlertCircle size={16} />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-dashed border-gray-200">
              <ul className="text-[11px] text-gray-400 space-y-1.5 list-disc pl-4 italic font-medium">
                <li>Vui lòng giữ nguyên nội dung chuyển khoản để hệ thống tự động xác nhận.</li>
                <li>Sau khi chuyển khoản thành công, vui lòng chờ trong giây lát.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;
