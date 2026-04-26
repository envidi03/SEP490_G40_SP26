const cron = require('node-cron');
const Invoice = require('../model/invoice.model');
const notificationService = require('../../notification/service/notification.service');
const logger = require('../../../common/utils/logger');
// Khuyến nghị dùng thư viện moment-timezone để xử lý ngày tháng an toàn trên server
// const moment = require('moment-timezone'); 

const initRevenueJobs = () => {
    // Chạy vào lúc 23:55 mỗi ngày theo đúng giờ Việt Nam
    cron.schedule('55 23 * * *', async () => {
        logger.info('[CronJob] Starting daily revenue report aggregation', { context: 'initRevenueJobs' });
        
        try {
            const now = new Date();
            // Lấy từ 00:00:00 đến 23:59:59 của ngày hôm nay
            // Lưu ý: Nếu server chạy UTC, hàm getFullYear/getMonth/getDate có thể bị lệch. 
            // Cẩn thận nhất là dùng moment().tz("Asia/Ho_Chi_Minh").startOf('day').toDate()
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

            // Tối ưu: Dùng Aggregation của MongoDB để tính tổng trực tiếp dưới Database
            // Thay đổi createdAt thành updatedAt (hoặc paidAt nếu có) để bắt đúng hóa đơn được thanh toán trong ngày
            const result = await Invoice.aggregate([
                {
                    $match: {
                        status: 'COMPLETED',
                        updatedAt: { // Chốt doanh thu theo thời điểm hoàn thành thanh toán
                            $gte: startOfDay,
                            $lte: endOfDay
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: '$total_amount' },
                        invoiceCount: { $sum: 1 } // Đếm luôn số lượng hóa đơn
                    }
                }
            ]);

            const totalRevenue = result.length > 0 ? result[0].totalRevenue : 0;
            const invoiceCount = result.length > 0 ? result[0].invoiceCount : 0;
            
            // Format sang dạng VNĐ
            const formattedRevenue = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenue);

            // Gửi thông báo cho Admin (Frontend - Giữ nguyên tiếng Việt)
            await notificationService.sendToRole(['ADMIN_CLINIC'], {
                type: 'DAILY_REVENUE_REPORT',
                title: 'Báo cáo doanh thu ngày',
                message: `Chốt sổ ngày ${now.toLocaleDateString('vi-VN')}: Tổng số ${invoiceCount} hoá đơn đã thanh toán. Tổng doanh thu: ${formattedRevenue}.`,
                action_url: `/reports/revenue`
            });
            
            // Log Backend giữ nguyên Tiếng Anh
            logger.info('[CronJob] Successfully generated and sent daily revenue report', {
                date: now.toISOString(),
                totalInvoices: invoiceCount,
                revenueStr: formattedRevenue
            });

        } catch (err) {
            logger.error('[CronJob] Error generating daily revenue report', {
                context: 'initRevenueJobs',
                error: err.message,
                stack: err.stack
            });
        }
    }, {
        scheduled: true,
        timezone: "Asia/Ho_Chi_Minh" // Bắt buộc phải có để cron chạy chuẩn múi giờ VN trên Cloud
    });
};

module.exports = initRevenueJobs;