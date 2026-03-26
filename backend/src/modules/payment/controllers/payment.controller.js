const logger = require('../../../common/utils/logger');
const Payment = require('../models/Payment');
const Invoice = require('../../billing/model/invoice.model');

const paymentController = async (req, res) => {
    try {
        // 1. Kiểm tra bảo mật từ SePay
        const authHeader = req.headers['authorization'];
        const expectedAuth = `Apikey ${process.env.SEPAY_WEBHOOK_SECRET}`;

        if (!authHeader || authHeader !== expectedAuth) {
            logger.warn('Unauthorized access attempt to payment webhook');
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }

        // 2. Lấy dữ liệu SePay gửi sang
        const { id, transferAmount, content, referenceCode, transactionDate } = req.body;

        logger.debug(`[SePay] Đang xử lý giao dịch ID: ${id} - Số tiền: ${transferAmount}`);

        // 3. Chống lưu trùng dữ liệu (Idempotency)
        const existingTx = await Payment.findOne({ sepay_id: String(id) });
        if (existingTx) {
            logger.info(`Giao dịch ${id} đã tồn tại. Trả về data cũ.`);
            return res.status(200).json({
                success: true,
                message: 'Giao dịch đã được xử lý trước đó',
                invoiceCode: existingTx.invoice_code, // Trả về invoiceCode
                data: existingTx
            });
        }

        // 4. Bóc tách mã hóa đơn (Tìm chữ DCMS...)
        const match = content.match(new RegExp(`${process.env.MATCH_CONTENT}\\d+`, 'i'));
        const invoiceCode = match ? match[0].toUpperCase() : null;

        let invoiceId = null;
        let finalStatus = invoiceCode ? 'MATCHED' : 'UNMATCHED';

        // 5. Cập nhật trạng thái hóa đơn ngay lập tức nếu tìm thấy mã
        if (invoiceCode) {
            try {
                const invoice = await Invoice.findOneAndUpdate(
                    { invoice_code: invoiceCode, status: 'PENDING' },
                    {
                        status: 'COMPLETED',
                        note: (content ? content + ' | ' : '') + 'Thanh toán qua SePay Webhook'
                    },
                    { new: true }
                );

                if (invoice) {
                    invoiceId = invoice._id;
                    logger.info(`Đã tự động cập nhật Trạng thái hóa đơn ${invoiceCode} sang COMPLETED.`);
                } else {
                    logger.warn(`Khớp mã SePay nhưng không tìm thấy Hóa đơn trong DB: ${invoiceCode}`);
                    finalStatus = 'UNMATCHED'; // Không tìm thấy HĐ thì coi như chưa khớp thực tế
                }
            } catch (invoiceError) {
                logger.error(`Lỗi khi cập nhật Hóa đơn ${invoiceCode}:`, invoiceError);
            }
        }

        // 6. Lưu vào Database (Bảng Payment)
        const newPayment = new Payment({
            sepay_id: String(id),
            invoice_id: invoiceId,
            invoice_code: invoiceCode,
            amount: transferAmount,
            reference_code: referenceCode,
            raw_content: content,
            status: finalStatus,
            transaction_date: transactionDate ? new Date(transactionDate) : new Date()
        });

        const savedPayment = await newPayment.save();

        logger.info(`Đã lưu thành công giao dịch SePay ${id} vào Database.`);

        // 7. Trả về thông tin giao dịch
        return res.status(200).json({
            success: true,
            message: 'Lưu giao dịch và cập nhật hóa đơn thành công',
            invoiceCode: invoiceCode,
            data: savedPayment
        });

    } catch (error) {
        logger.error('Error in paymentController:', {
            error: error.message,
            stack: error.stack
        });
        return res.status(500).json({ success: false, message: 'Lỗi server khi xử lý giao dịch' });
    }
};

const checkPaymentStatus = async (req, res) => {
    try {
        const { invoiceCode } = req.params;

        // Tìm trong bảng Payment xem đã có cục tiền nào khớp với mã Hóa đơn này chưa
        const payment = await Payment.findOne({
            invoice_code: invoiceCode,
            status: 'MATCHED' // Đảm bảo khoản tiền đã khớp thành công
        });

        if (payment) {
            // Đảm bảo Hóa đơn cũng được cập nhật (trong trường hợp Webhook bị chậm hoặc lỗi)
            await Invoice.findOneAndUpdate(
                { invoice_code: invoiceCode, status: 'PENDING' },
                {
                    status: 'COMPLETED',
                    note: 'Thanh toán qua SePay (Polling check)'
                }
            );

            // Có tiền rồi! Báo cho FE biết để tick xanh
            return res.status(200).json({ status: 'PAID' });
        } else {
            // Chưa có, FE cứ đợi tiếp
            return res.status(200).json({ status: 'PENDING' });
        }
    } catch (error) {
        logger.error('Error in checkPaymentStatus:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};

module.exports = { paymentController, checkPaymentStatus };