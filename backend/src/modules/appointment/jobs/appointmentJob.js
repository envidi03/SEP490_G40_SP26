const cron = require('node-cron');
const { Appointment } = require('../models/index.model');
const logger = require('../../../common/utils/logger');
const NotificationService = require('../../notification/service/notification.service');
const EmailService = require('../../../common/service/email.service');

const initAppointmentJobs = () => {
    // Chạy mỗi 10 phút một lần
    cron.schedule('*/10 * * * *', async () => {
        console.log('--- Đang kiểm tra lịch hẹn quá hạn ---');
        try {
            const now = new Date();

            // Dùng UTC để khớp với cách MongoDB lưu trữ appointment_date
            const currentDayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

            // Tính mốc thời gian cách đây 30 phút (theo giờ local server UTC+7)
            const thirtyMinsAgo = new Date(Date.now() - 30 * 60000);
            // Dùng giờ local (UTC+7) để so sánh với appointment_time dạng "HH:mm" của VN
            const compareHour = thirtyMinsAgo.getHours().toString().padStart(2, '0');
            const compareMinute = thirtyMinsAgo.getMinutes().toString().padStart(2, '0');
            const currentTimeStr = `${compareHour}:${compareMinute}`;

            // 1. Tìm các lịch hẹn quá hạn nhưng chưa được xử lý
            const overdueAppointments = await Appointment.find({
                status: "SCHEDULED",
                $or: [
                    { appointment_date: { $lt: currentDayUTC } }, // Đã qua ngày hôm nay (UTC)
                    {
                        appointment_date: currentDayUTC,           // Đúng ngày hôm nay (UTC)
                        appointment_time: { $lt: currentTimeStr }  // Giờ hẹn đã quá 30 phút
                    }
                ]
            }).populate({
                path: 'patient_id',
                select: 'account_id'
            });

            if (overdueAppointments.length > 0) {
                logger.info(`Tìm thấy ${overdueAppointments.length} lịch hẹn quá hạn.`);

                for (const appointment of overdueAppointments) {
                    try {
                        const patientName = appointment.full_name;
                        const appointmentDate = new Date(appointment.appointment_date).toLocaleDateString('vi-VN');
                        const appointmentTime = appointment.appointment_time;

                        // 2. Gửi thông báo hệ thống (nếu có tài khoản)
                        if (appointment.patient_id && appointment.patient_id.account_id) {
                            await NotificationService.sendToUser(appointment.patient_id.account_id, {
                                type: 'APPOINTMENT_NO_SHOW',
                                title: 'Thông báo vắng mặt',
                                message: `Bạn đã vắng mặt trong lịch hẹn ngày ${appointmentDate} lúc ${appointmentTime}. Lịch hẹn đã được chuyển sang trạng thái Vắng mặt.`,
                                action_url: '/appointments'
                            });
                        }

                        // 3. Gửi Email thông báo
                        if (appointment.email) {
                            await EmailService.sendNoShowEmail(
                                appointment.email,
                                patientName,
                                appointmentDate,
                                appointmentTime
                            );
                        }

                        // 4. Cập nhật trạng thái
                        appointment.status = "NO_SHOW";
                        await appointment.save();

                    } catch (singleErr) {
                        logger.error(`Lỗi khi xử lý thông báo NO_SHOW cho lịch hẹn ${appointment._id}`, {
                            error: singleErr.message
                        });
                    }
                }

                logger.info(`Đã hoàn thành cập nhật ${overdueAppointments.length} lịch hẹn sang NO_SHOW.`);
            }
        } catch (err) {
            logger.error("Lỗi trong Cron job kiểm tra lịch hẹn", {
                error: err.message
            });
        }
    });
};

module.exports = initAppointmentJobs;