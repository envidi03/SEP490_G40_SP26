const cron = require('node-cron');
const Medicine = require('../model/medicine.model');
const notificationService = require('../../notification/service/notification.service');
const logger = require('../../../common/utils/logger');

const initInventoryJobs = () => {
    // Chạy vào lúc 00:00 mỗi ngày
    // Cú pháp: 'phút giờ ngày tháng thứ'
    cron.schedule('0 0 * * *', async () => {
        logger.info('--- Đang kiểm tra thuốc sắp hết hạn ---');
        try {
            const now = new Date();
            // Lọc thuốc sẽ hết hạn trong 90 ngày tới
            const next90Days = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

            const expiringMedicines = await Medicine.find({
                status: 'AVAILABLE',
                expiry_date: {
                    $gt: now,
                    $lte: next90Days
                }
            }).select('medicine_name expiry_date quantity unit');

            if (expiringMedicines.length > 0) {
                logger.info(`Tìm thấy ${expiringMedicines.length} loại thuốc sắp hết hạn.`);
                
                // Gom danh sách tên thuốc (tối đa lấy 3 tên để không dài dòng)
                const names = expiringMedicines.slice(0, 3).map(m => m.medicine_name).join(', ');
                const moreText = expiringMedicines.length > 3 ? ` và ${expiringMedicines.length - 3} loại khác` : '';

                // Gửi thông báo cho Dược sĩ
                await notificationService.sendToRole(['PHARMACIST'], {
                    type: 'EXPIRING_MEDICINE',
                    title: 'Cảnh báo Thuốc sắp hết hạn',
                    message: `Có ${expiringMedicines.length} loại thuốc/vật tư đang chuẩn bị hết hạn sử dụng (${names}${moreText}). Vui lòng kiểm tra kho để có phương án xử lý.`,
                    action_url: `/inventory/medicines`
                });
            } else {
                logger.info('Không có thuốc nào sắp hết hạn trong 90 ngày tới.');
            }
        } catch (err) {
            logger.error("Lỗi Cron job kho (Thuốc sắp hết hạn)", {
                error: err.message
            });
        }
    });
};

module.exports = initInventoryJobs;
