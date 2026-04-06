const cron = require('node-cron');
const Appointment = require('../models/appointment.model'); // Điều chỉnh lại đường dẫn cho đúng với project của bạn
const logger = require('../../../common/utils/logger');
const NotificationService = require('../../notification/service/notification.service');
const EmailService = require('../../../common/service/email.service');

const initReminderJobs = () => {
    // Chạy vào lúc 08:00 sáng mỗi ngày (Giờ local của server)
    cron.schedule('0 8 * * *', async () => {
        logger.info('--- Starting daily appointment reminder cron job (24h prior) ---');
        try {
            const now = new Date();

            // Lấy ngày mai
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);

            // Dùng UTC để khớp với cách MongoDB lưu trữ appointment_date (00:00:00.000 UTC)
            const tomorrowDayUTC = new Date(Date.UTC(tomorrow.getUTCFullYear(), tomorrow.getUTCMonth(), tomorrow.getUTCDate()));

            // Tìm các lịch hẹn có trạng thái SCHEDULED vào ngày mai
            const upcomingAppointments = await Appointment.find({
                status: "SCHEDULED",
                appointment_date: tomorrowDayUTC
            }).populate({
                path: 'patient_id',
                select: 'account_id'
            });

            if (upcomingAppointments.length > 0) {
                logger.info(`Found ${upcomingAppointments.length} appointments for tomorrow. Sending reminders...`);

                let successCount = 0;

                for (const appointment of upcomingAppointments) {
                    try {
                        const patientName = appointment.full_name;
                        const appointmentDate = new Date(appointment.appointment_date).toLocaleDateString('vi-VN');
                        const appointmentTime = appointment.appointment_time;

                        // 1. Gửi thông báo qua hệ thống (Push notification / In-app)
                        if (appointment.patient_id && appointment.patient_id.account_id) {
                            await NotificationService.sendToUser(appointment.patient_id.account_id, {
                                type: 'APPOINTMENT_REMINDER',
                                title: 'Nhắc nhở lịch hẹn ngày mai',
                                message: `Chào ${patientName}, bạn có lịch hẹn khám nha khoa vào lúc ${appointmentTime} ngày mai (${appointmentDate}). Vui lòng đến đúng giờ nhé!`,
                                action_url: `/appointments/${appointment._id}`
                            });
                        }

                        // 2. Gửi Email thông báo (nếu có email)
                        if (appointment.email) {
                            // Giả định bạn có hàm sendReminderEmail trong EmailService
                            await EmailService.sendReminderEmail(
                                appointment.email,
                                patientName,
                                appointmentDate,
                                appointmentTime
                            );
                        }

                        successCount++;
                    } catch (singleErr) {
                        logger.error(`Error sending reminder for appointment ${appointment._id}`, {
                            error: singleErr.message,
                            stack: singleErr.stack
                        });
                    }
                }

                logger.info(`Successfully sent reminders for ${successCount}/${upcomingAppointments.length} appointments.`);
            } else {
                logger.info('No upcoming appointments for tomorrow. Skipping reminders.');
            }
        } catch (err) {
            logger.error("Error in daily reminder Cron job", {
                error: err.message,
                stack: err.stack
            });
        }
    });
};

module.exports = initReminderJobs;