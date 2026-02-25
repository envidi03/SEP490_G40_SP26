const cron = require('node-cron');
const {Appointment} = require('../models/index.model'); 
const logger = require('../../../common/utils/logger');

const initAppointmentJobs = () => {
    // Chạy mỗi 10 phút một lần
    // Cú pháp: 'phút giờ ngày tháng thứ'
    cron.schedule('*/10 * * * *', async () => {
        console.log('--- Đang kiểm tra lịch hẹn quá hạn ---');
        try {
            const now = new Date();
            // Thiết lập mốc 0h00 của ngày hiện tại để so sánh ngày
            const currentDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            // Tính mốc thời gian cách đây 30 phút
            const thirtyMinsAgo = new Date(Date.now() - 30 * 60000);
            const currentTimeStr = thirtyMinsAgo.getHours().toString().padStart(2, '0') + ":" + 
                                   thirtyMinsAgo.getMinutes().toString().padStart(2, '0');

            const result = await Appointment.updateMany(
                {
                    status: "SCHEDULED",
                    $or: [
                        { appointment_date: { $lt: currentDay } }, // Đã quá ngày
                        { 
                            appointment_date: currentDay, 
                            appointment_time: { $lt: currentTimeStr } // Cùng ngày nhưng quá 30p
                        }
                    ]
                },
                { $set: { status: "NO_SHOW" } }
            );

            if (result.modifiedCount > 0) {
                logger.info("Thành công: Đã chuyển lịch hẹn sang NO_SHOW.", {
                    appointment: result.modifiedCount
                });
            }
        } catch (err) {
            logger.error("Lỗi Cron job", {
                error: err
            });
        }
    });
};

module.exports = initAppointmentJobs;