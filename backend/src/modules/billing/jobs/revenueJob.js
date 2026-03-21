const cron = require('node-cron');
const Invoice = require('../model/invoice.model');
const notificationService = require('../../notification/service/notification.service');
const logger = require('../../../common/utils/logger');

const initRevenueJobs = () => {
    // Chạy vào lúc 23:55 mỗi ngày để chốt sổ
    cron.schedule('55 23 * * *', async () => {
        logger.info('--- Đang tổng hợp báo cáo doanh thu cuối ngày ---');
        try {
            const now = new Date();
            // Lấy từ 00:00:00 đến 23:59:59 của ngày hôm nay
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

            // Tìm tất cả hoá đơn đã được thanh toán (COMPLETED) trong ngày
            const invoices = await Invoice.find({
                status: 'COMPLETED',
                createdAt: {
                    $gte: startOfDay,
                    $lte: endOfDay
                }
            }).select('total_amount');

            const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.total_amount, 0);
            
            // Format sang dạng VNĐ
            const formattedRevenue = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenue);

            // Gửi thông báo cho Admin
            await notificationService.sendToRole(['ADMIN_CLINIC'], {
                type: 'DAILY_REVENUE_REPORT',
                title: 'Báo cáo doanh thu ngày',
                message: `Chốt sổ ngày ${now.toLocaleDateString('vi-VN')}: Tổng số ${invoices.length} hoá đơn đã thanh toán. Tổng doanh thu: ${formattedRevenue}.`,
                action_url: `/reports/revenue`
            });
            
            logger.info(`Đã gửi báo cáo doanh thu ngày. Tổng: ${formattedRevenue} (${invoices.length} hoá đơn).`);

        } catch (err) {
            logger.error("Lỗi Cron job Báo cáo doanh thu", {
                error: err.message
            });
        }
    });
};

module.exports = initRevenueJobs;
