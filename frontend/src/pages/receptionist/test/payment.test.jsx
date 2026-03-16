import React, { useState, useEffect } from "react";
import axios from "axios";

const PaymentTest = ({amount = 2000, invoiceCode}) => {
    
  const matchContent = import.meta.env.VITE_MATCH_CONTENT || "INV";
  invoiceCode = `${matchContent}8002`;

  // Thông tin tài khoản ngân hàng (Lấy từ .env) - không thay đổi 
  const bankId = import.meta.env.VITE_BANK_ID || "BIDV";
  const accountNo = import.meta.env.VITE_BANK_ACCOUNT || "96247TOANTTHE172722";
  const accountName = import.meta.env.VITE_ACCOUNT_NAME || "TRAN TRUNG TOAN";

  // State quản lý trạng thái thanh toán
  const [isPaid, setIsPaid] = useState(false);

  const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${invoiceCode}&accountName=${accountName}`;

  // Cơ chế Polling: Hỏi thăm Backend mỗi 3 giây
  useEffect(() => {
    if (isPaid) return;

    const interval = setInterval(async () => {
      try {
        // Gọi API tự viết của bạn để check DB xem đơn DCMS8888 trạng thái là gì
        // (Lưu ý: Thay đổi URL này thành URL backend của bạn)
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/payment/invoices/check-status/${invoiceCode}`,
        );

        if (response.data.status === "PAID") {
          setIsPaid(true);
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
      }
    }, 3000); 

    return () => clearInterval(interval);
  }, [isPaid]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "40px",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          width: "350px",
          border: "1px solid #e0e0e0",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
          textAlign: "center",
        }}
      >
        {isPaid ? (
          // MÀN HÌNH THÀNH CÔNG
          <div>
            <div style={{ fontSize: "50px", color: "#4caf50" }}>✅</div>
            <h2 style={{ color: "#4caf50" }}>Thanh toán thành công!</h2>
            <p>Cảm ơn bạn đã sử dụng dịch vụ.</p>
          </div>
        ) : (
          // MÀN HÌNH CHỜ THANH TOÁN (Có mã QR)
          <>
            <h2 style={{ color: "#333", marginBottom: "8px" }}>
              Thanh toán dịch vụ
            </h2>
            <div
              style={{
                background: "#f5f5f5",
                padding: "15px",
                borderRadius: "12px",
                marginBottom: "20px",
              }}
            >
              <img
                src={qrUrl}
                alt="QR Code"
                style={{ width: "100%", borderRadius: "8px" }}
              />
            </div>
            <p style={{ fontSize: "14px", color: "#666" }}>
              Số tiền: <strong>{amount.toLocaleString()}đ</strong>
            </p>
            <p style={{ fontSize: "14px", color: "#666" }}>
              Nội dung: <strong>{invoiceCode}</strong>
            </p>
            <p
              style={{
                marginTop: "20px",
                color: "#ff9800",
                fontWeight: "bold",
              }}
            >
              ⏳ Đang chờ khách hàng quét mã...
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentTest;
