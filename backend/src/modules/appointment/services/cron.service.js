const cron = require('node-cron');
const Appointment = require('../models/appointment.model'); 
const notificationService = require('./../../notification/service/notification.service'); 
const emailService = require('../../../common/service/email.service');

const startAppointmentReminderCron = () => {
    // Chạy job này MỖI PHÚT 1 LẦN ('* * * * *')
    cron.schedule('* * * * *', async () => {
        try {
            // 1. Lấy thời gian hiện tại và cộng thêm đúng 30 phút
            const targetDate = new Date();
            targetDate.setMinutes(targetDate.getMinutes() + 30);

            // 2. Chuyển thành chuỗi "HH:mm" để khớp với format lưu trong DB
            const hours = String(targetDate.getHours()).padStart(2, '0');
            const minutes = String(targetDate.getMinutes()).padStart(2, '0');
            const targetTimeString = `${hours}:${minutes}`; // VD: "09:00"

            // 3. Tạo mốc đầu ngày và cuối ngày để lọc appointment_date
            const startOfDay = new Date(targetDate);
            startOfDay.setHours(0, 0, 0, 0);
            
            const endOfDay = new Date(targetDate);
            endOfDay.setHours(23, 59, 59, 999);

            // 4. Tìm các lịch hẹn thỏa mãn điều kiện
            const upcomingAppointments = await Appointment.find({
                status: 'SCHEDULED', // Chỉ nhắc lịch chưa khám/chưa hủy
                appointment_time: targetTimeString,
                appointment_date: {
                    $gte: startOfDay,
                    $lte: endOfDay
                }
            }).populate('patient_id'); // Populate để lấy thông tin user/account

            if (upcomingAppointments.length === 0) return;

            // 5. Gửi thông báo cho từng bệnh nhân
            for (const appt of upcomingAppointments) {
                
                // === A. GỬI THÔNG BÁO IN-APP (TÙY CHỌN, NẾU CÓ ACCOUNT) ===
                const accountId = appt.patient_id?.account_id || appt.patient_id?._id; 
                if (accountId) {
                    try {
                        // Gọi hàm tạo thông báo từ notification service
                        await notificationService.createNotification({
                            sender_id: null,
                            scope: 'INDIVIDUAL',
                            type: 'APPOINTMENT_REMINDER',
                            recipient_id: accountId,
                            title: '⏳ Nhắc nhở lịch hẹn sắp tới!',
                            message: `Chào ${appt.full_name}, bạn có lịch hẹn khám nha khoa vào lúc ${appt.appointment_time} hôm nay. Vui lòng đến đúng giờ để được phục vụ tốt nhất nhé!`,
                            metadata: {
                                entity_id: appt._id,
                                entity_type: 'APPOINTMENT'
                            }
                        });
                    } catch (notifyErr) {
                        // Bắt lỗi riêng để không làm chết vòng lặp
                        console.error(`[CRON] Lỗi gửi In-App Notify cho lịch ${appt._id}:`, notifyErr.message);
                    }
                }

                // === B. GỬI EMAIL NHẮC HẸN ===
                if (appt.email) {
                    try {
                        // Gọi hàm từ EmailService đã tạo
                        await emailService.sendAppointmentReminder(appt);
                    } catch (emailErr) {
                        // Bắt lỗi riêng để nếu gửi mail người này xịt thì người kia vẫn nhận được
                        console.error(`[CRON] Lỗi gửi Email cho lịch ${appt._id} (${appt.email}):`, emailErr.message);
                    }
                }
            }

            if (upcomingAppointments.length > 0) {
                console.log(`[CRON] Đã gửi thông báo & email nhắc hẹn cho ${upcomingAppointments.length} bệnh nhân lúc ${targetTimeString}`);
            }

        } catch (error) {
            console.error("[CRON] Lỗi khi chạy job nhắc hẹn:", error);
        }
    });
};

module.exports = { startAppointmentReminderCron };