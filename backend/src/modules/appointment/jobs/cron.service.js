const cron = require('node-cron');
const moment = require('moment-timezone');
const Appointment = require('../models/appointment.model');
const logger = require('../../../common/utils/logger');
const NotificationService = require('../../notification/service/notification.service');
const EmailService = require('../../../common/service/email.service');

// ==============================================================
// HÀM HỖ TRỢ GỬI THÔNG BÁO (DÙNG CHUNG CHO CÁC MỐC NHẮC HẸN)
// ==============================================================
async function sendReminders(appointment, message, type) {
    try {
        // 1. Gửi Push Notification (In-app)
        if (appointment.patient_id?.account_id) {
            await NotificationService.createNotification({
                sender_id: null,
                scope: 'INDIVIDUAL',
                type: 'APPOINTMENT_REMINDER',
                recipient_id: appointment.patient_id.account_id,
                title: '⏳ Nhắc nhở lịch hẹn',
                message: message,
                metadata: {
                    entity_id: appointment._id,
                    entity_type: 'APPOINTMENT'
                },
                channels: {
                    in_app: { enabled: true },
                    sms: { enabled: true }
                }
            });
        }

        // 2. Gửi Email
        if (appointment.email) {
            await EmailService.sendAppointmentReminder(appointment);
        }

        // 3. Đánh dấu mốc này đã gửi vào array reminders_sent
        await Appointment.findByIdAndUpdate(appointment._id, {
            $addToSet: { reminders_sent: type }
        });

        logger.info(`[CRON gửi thông báo] Đã gửi thông báo (${type}) cho lịch hẹn ${appointment._id}`);
    } catch (err) {
        logger.error(`[CRON gửi thông báo] Lỗi khi gửi thông báo (${type}):`, { error: err.message });
    }
}


// ==============================================================
// JOB 1: NHẮC HẸN ĐA MỐC THỜI GIAN (ĐÃ FIX LỖI TIMEZONE & NGÀY)
// ==============================================================
const initReminderJobs = () => {
    logger.info('[CRON nhắc lịch hẹn] Reminder job scheduled to run every minute');
    cron.schedule('* * * * *', async () => {
        try {
            // 1. Ép múi giờ chuẩn Việt Nam cho hiện tại
            const now = moment().tz("Asia/Ho_Chi_Minh");

            // 2. Lấy đầu ngày và cuối ngày của 2 ngày tới (an toàn không sót lịch)
            const startSearch = now.clone().startOf('day').toDate();
            const endSearch = now.clone().add(2, 'days').endOf('day').toDate();

            const appointments = await Appointment.find({
                status: "SCHEDULED",
                appointment_date: { $gte: startSearch, $lte: endSearch }
            }).populate({
                path: 'patient_id',
                select: 'account_id'
            });

            for (const app of appointments) {
                const [hours, minutes] = app.appointment_time.split(':');

                // 3. Ép múi giờ Việt Nam khi tạo mốc giờ hẹn
                const appointmentMoment = moment(app.appointment_date)
                    .tz("Asia/Ho_Chi_Minh") // Quan trọng: Đưa mốc ngày về giờ VN
                    .set({ hour: parseInt(hours), minute: parseInt(minutes), second: 0, millisecond: 0 });

                // Tính khoảng cách phút từ bây giờ đến giờ hẹn
                const diffMinutes = appointmentMoment.diff(now, 'minutes');

                let reminderType = null;
                let message = "";

                // Xác định mốc (cửa sổ 10-15 phút để cron chạy an toàn không bị lọt)
                if (diffMinutes <= 1440 && diffMinutes > 1425 && !app.reminders_sent.includes('1D')) {
                    reminderType = '1D';
                    message = `Bạn có lịch hẹn vào ngày mai lúc ${app.appointment_time}.`;
                } else if (diffMinutes <= 120 && diffMinutes > 105 && !app.reminders_sent.includes('2H')) {
                    reminderType = '2H';
                    message = `Chỉ còn 2 giờ nữa là đến lịch hẹn của bạn (${app.appointment_time}).`;
                } else if (diffMinutes <= 60 && diffMinutes > 45 && !app.reminders_sent.includes('1H')) {
                    reminderType = '1H';
                    message = `Lịch hẹn của bạn sẽ bắt đầu sau 1 giờ nữa.`;
                } else if (diffMinutes <= 30 && diffMinutes > 20 && !app.reminders_sent.includes('30M')) {
                    reminderType = '30M';
                    message = `Nhắc nhở: 30 phút nữa bạn có lịch hẹn khám.`;
                } else if (diffMinutes <= 15 && diffMinutes >= 0 && !app.reminders_sent.includes('15M')) {
                    reminderType = '15M';
                    message = `Lịch hẹn của bạn sẽ bắt đầu sau 15 phút. Vui lòng chuẩn bị!`;
                }

                if (diffMinutes >= 0 && diffMinutes <= 1440) {
                    logger.debug(`[CRON nhắc lịch hẹn] ${app.full_name} (${app.appointment_time}) | Cách hiện tại: ${diffMinutes} phút | Đã gửi: [${app.reminders_sent.join(', ')}]`);
                }

                if (reminderType) {
                    logger.info(`[CRON nhắc lịch hẹn] Chuẩn bị gửi ${reminderType}: "${message}" cho lịch ${app._id}`);
                    await sendReminders(app, message, reminderType);
                }
            }
        } catch (err) {
            logger.error("[CRON nhắc lịch hẹn] Lỗi trong Reminder Cron Job", { error: err.message });
        }
    });
};

// ==============================================================
// JOB 2: TỰ ĐỘNG CHUYỂN NO_SHOW (ĐÃ FIX LỖI TIMEZONE)
// ==============================================================
const startNoShowCheckCron = () => {
    logger.info('[CRON đổi trạng thái] No-show check job scheduled to run every minute');
    cron.schedule('* * * * *', async () => {
        try {
            // 1. Ép múi giờ chuẩn Việt Nam cho thời điểm hiện tại
            const now = moment().tz("Asia/Ho_Chi_Minh");

            // Lấy khoảng thời gian của ngày hôm nay (đã chuẩn hóa theo múi giờ VN)
            const startOfDay = now.clone().startOf('day').toDate();
            const endOfDay = now.clone().endOf('day').toDate();

            // Tìm các lịch hẹn hôm nay vẫn đang SCHEDULED
            const todaysAppointments = await Appointment.find({
                status: 'SCHEDULED',
                appointment_date: { $gte: startOfDay, $lte: endOfDay }
            });

            let noShowCount = 0;

            for (const app of todaysAppointments) {
                // Tạo moment chính xác của giờ hẹn
                const [hours, minutes] = app.appointment_time.split(':');

                // 2. Ép múi giờ Việt Nam khi tạo mốc giờ hẹn để so sánh chính xác
                const appointmentMoment = moment(app.appointment_date)
                    .tz("Asia/Ho_Chi_Minh") // Quan trọng: Đưa mốc ngày về giờ VN
                    .set({ hour: parseInt(hours), minute: parseInt(minutes), second: 0, millisecond: 0 });

                // Tính xem bây giờ ĐÃ TRÔI QUA bao nhiêu phút so với giờ hẹn
                // Nếu now > appointmentMoment (hiện tại đã vượt qua giờ hẹn) thì minutesPassed sẽ là số dương
                const minutesPassed = now.diff(appointmentMoment, 'minutes');

                // NẾU ĐÃ QUÁ HẠN TỪ 60 PHÚT TRỞ LÊN
                if (minutesPassed >= 60) {
                    app.status = 'NO_SHOW';
                    await app.save();
                    noShowCount++;
                    logger.info(`[CRON đổi trạng thái] Lịch hẹn của ${app.full_name} (${app.appointment_time}) đã chuyển thành NO_SHOW do trễ ${minutesPassed} phút.`);
                }
            }

            if (noShowCount > 0) {
                logger.info(`[CRON đổi trạng thái] Quét xong. Đã cập nhật ${noShowCount} lịch hẹn thành NO_SHOW.`);
            }

        } catch (err) {
            logger.error("[CRON đổi trạng thái] Lỗi trong NO_SHOW Check Job", { error: err.message });
        }
    });
};

module.exports = {
    initReminderJobs,
    startNoShowCheckCron
};