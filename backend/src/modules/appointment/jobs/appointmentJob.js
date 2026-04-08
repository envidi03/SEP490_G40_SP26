const cron = require('node-cron');
const Appointment = require('../models/appointment.model');
const logger = require('../../../common/utils/logger');
const NotificationService = require('../../notification/service/notification.service');
const EmailService = require('../../../common/service/email.service');
const moment = require('moment-timezone'); // Bạn đã có thư viện này trong package.json

const initReminderJobs = () => {
    // Chạy mỗi phút một lần để kiểm tra các mốc thời gian ngắn (2h, 1h, 30', 15')
    cron.schedule('* * * * *', async () => {
        try {
            const now = moment();

            // Tìm các lịch hẹn SCHEDULED trong vòng 24 giờ tới
            // Chúng ta lấy dôi ra một chút để không bỏ sót
            const startSearch = now.clone().toDate();
            const endSearch = now.clone().add(25, 'hours').toDate();

            const appointments = await Appointment.find({
                status: "SCHEDULED",
                appointment_date: { $gte: startSearch, $lte: endSearch }
            }).populate({
                path: 'patient_id',
                select: 'account_id'
            });

            for (const app of appointments) {
                // Kết hợp ngày và giờ để có thời điểm hẹn chính xác
                // Giả sử app.appointment_time có dạng "14:30"
                const [hours, minutes] = app.appointment_time.split(':');
                const appointmentMoment = moment(app.appointment_date)
                    .set({ hour: parseInt(hours), minute: parseInt(minutes), second: 0 });

                const diffMinutes = appointmentMoment.diff(now, 'minutes');

                let reminderType = null;
                let message = "";

                // Xác định mốc nhắc nhở
                if (diffMinutes <= 1440 && diffMinutes > 1430 && !app.reminders_sent.includes('1D')) {
                    reminderType = '1D';
                    message = `Bạn có lịch hẹn vào ngày mai lúc ${app.appointment_time}.`;
                } else if (diffMinutes <= 120 && diffMinutes > 110 && !app.reminders_sent.includes('2H')) {
                    reminderType = '2H';
                    message = `Chỉ còn 2 giờ nữa là đến lịch hẹn của bạn (${app.appointment_time}).`;
                } else if (diffMinutes <= 60 && diffMinutes > 50 && !app.reminders_sent.includes('1H')) {
                    reminderType = '1H';
                    message = `Lịch hẹn của bạn sẽ bắt đầu sau 1 giờ nữa.`;
                } else if (diffMinutes <= 30 && diffMinutes > 25 && !app.reminders_sent.includes('30M')) {
                    reminderType = '30M';
                    message = `Nhắc nhở: 30 phút nữa bạn có lịch hẹn khám.`;
                } else if (diffMinutes <= 15 && diffMinutes > 0 && !app.reminders_sent.includes('15M')) {
                    reminderType = '15M';
                    message = `Lịch hẹn của bạn sẽ bắt đầu sau 15 phút. Vui lòng chuẩn bị!`;
                }

                if (reminderType) {
                    await sendReminders(app, message, reminderType);
                }
            }
        } catch (err) {
            logger.error("Error in Reminder Cron Job", { error: err.message });
        }
    });
};

async function sendReminders(appointment, message, type) {
    try {
        // 1. Gửi Push Notification
        if (appointment.patient_id?.account_id) {
            await NotificationService.sendToUser(appointment.patient_id.account_id, {
                type: 'APPOINTMENT_REMINDER',
                title: 'Nhắc nhở lịch hẹn',
                message: message,
                action_url: `/appointments/${appointment._id}`
            });
        }

        // 2. Gửi Email
        if (appointment.email) {
            // Sử dụng hàm sendAppointmentReminder mà bạn đã có trong EmailService
            // Lưu ý: Bạn có thể cần truyền thêm message để nội dung email linh hoạt theo mốc thời gian
            await EmailService.sendAppointmentReminder(appointment);
        }

        // 3. Đánh dấu đã gửi mốc này để không gửi lại
        await Appointment.findByIdAndUpdate(appointment._id, {
            $addToSet: { reminders_sent: type }
        });

        logger.info(`Sent ${type} reminder for appointment ${appointment._id}`);
    } catch (err) {
        logger.error(`Failed to send ${type} reminder`, { error: err.message });
    }
}

module.exports = initReminderJobs;