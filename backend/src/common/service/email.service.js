const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
require('dotenv').config();

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        })
    }

    async sendEmailVerificationEmail(email, verificationToken, userName = '') {
        const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
        const subject = 'Verify Your Email - Dental Clinic Management System';
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button-container { text-align: center; margin: 30px 0; }
                    .verify-button { 
                        display: inline-block;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 15px 40px;
                        text-decoration: none;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: bold;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    }
                    .verify-button:hover { opacity: 0.9; }
                    .alternative { 
                        background: #f0f0f0; 
                        padding: 15px; 
                        margin: 20px 0; 
                        border-radius: 8px;
                        font-size: 12px;
                        word-break: break-all;
                    }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✉️ Xác minh email</h1>
                    </div>
                    <div class="content">
                        <p>Chào ${userName ? userName : 'bạn'},</p>
                        <p>Cảm ơn bạn đã đăng ký với <strong>DentalCMS</strong>! Vui lòng xác minh địa chỉ email của bạn bằng cách nhấp vào nút bên dưới:</p>
                        
                        <div class="button-container">
                            <a href="${verificationLink}" class="verify-button">
                                Xác minh Email
                            </a>
                        </div>
                        
                        <p style="text-align: center; color: #666; font-size: 14px;">
                            Hoặc sao chép link sau vào trình duyệt:
                        </p>
                        <div class="alternative">
                            <a href="${verificationLink}" style="color: #667eea;">${verificationLink}</a>
                        </div>
                        
                        <p style="color: #f5576c; font-weight: bold;">⏰ Link này sẽ hết hạn sau 1 giờ.</p>
                        <p>Nếu bạn không yêu cầu xác minh này, vui lòng bỏ qua email này.</p>
                        
                        <div class="footer">
                            <p>© 2026 Dental CMS. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail(email, subject, html);
    }

    async sendPasswordResetEmail(email, otp, userName = '') {
        logger.info('[EmailService] Preparing to send password reset email', { email: email, user: userName });
        const subject = 'Password Reset Request - Dental Clinic Management System';
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .otp-box { background: white; border: 2px dashed #f5576c; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
                    .otp-code { font-size: 32px; font-weight: bold; color: #f5576c; letter-spacing: 5px; }
                    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔐 Password Reset</h1>
                    </div>
                    <div class="content">
                        <p>Hello${userName ? ' ' + userName : ''},</p>
                        <p>We received a request to reset your password. Please use the following OTP code to proceed:</p>
                        <div class="otp-box">
                            <div class="otp-code">${otp}</div>
                        </div>
                        <p>This code will expire in ${process.env.OTP_EXPIRES_MINUTES || 15} minutes.</p>
                        <div class="warning">
                            <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email and ensure your account is secure.
                        </div>
                        <div class="footer">
                            <p>© 2026 Booking App. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail(email, subject, html);
    }

    async sendCheckinEmail(email, patientName, queueNumber) {
        // Nếu không có email thì bỏ qua luôn để tránh lỗi
        if (!email) return;

        const subject = 'Check-in Thành Công - Dental Clinic Management System';
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .queue-box { background: white; border: 2px dashed #38ef7d; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
                    .queue-number { font-size: 48px; font-weight: bold; color: #11998e; margin: 0; }
                    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    .info-table td { padding: 10px 0; border-bottom: 1px solid #eee; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0;">✅ Check-in Thành Công</h1>
                    </div>
                    <div class="content">
                        <p>Xin chào <strong>${patientName}</strong>,</p>
                        <p>Bạn đã check-in thành công cho lịch hẹn tại <strong>${process.env.SMTP_FROM_NAME || 'Dental CMS'}</strong>.</p>
                        
                        <div class="queue-box">
                            <p style="margin: 0 0 10px 0; font-size: 16px; color: #666;">Số thứ tự của bạn là:</p>
                            <div class="queue-number">${queueNumber}</div>
                        </div>
                        
                        <p>Vui lòng chú ý lắng nghe loa thông báo hoặc theo dõi màn hình tại phòng chờ để biết khi đến lượt khám.</p>
                        <p>Xin cảm ơn và chúc bạn nhiều sức khỏe!</p>
                        
                        <div class="footer">
                            <p>© 2026 ${process.env.SMTP_FROM_NAME || 'Dental CMS'}. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;
        return this.sendEmail(email, subject, html);
    }

    async sendBookingConfirmationEmail(email, patientName, date, time) {
        if (!email) return;

        const subject = 'Xác nhận Đặt lịch khám - Dental Clinic Management System';
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .info-box { background: white; border-left: 4px solid #4facfe; padding: 20px; margin: 20px 0; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
                    .info-table { width: 100%; border-collapse: collapse; }
                    .info-table td { padding: 10px 0; border-bottom: 1px solid #eee; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0;">📅 Đặt Lịch Thành Công</h1>
                    </div>
                    <div class="content">
                        <p>Xin chào <strong>${patientName}</strong>,</p>
                        <p>Cảm ơn bạn đã tin tưởng và đặt lịch khám tại <strong>${process.env.SMTP_FROM_NAME || 'Dental CMS'}</strong>.</p>
                        <p>Thông tin lịch hẹn của bạn như sau:</p>
                        
                        <div class="info-box">
                            <table class="info-table">
                                <tr>
                                    <td><strong>Ngày khám:</strong></td>
                                    <td style="text-align: right; color: #4facfe; font-weight: bold;">${date}</td>
                                </tr>
                                <tr>
                                    <td><strong>Giờ dự kiến:</strong></td>
                                    <td style="text-align: right; color: #4facfe; font-weight: bold;">${time}</td>
                                </tr>
                            </table>
                        </div>
                        
                        <p style="color: #d9534f; font-size: 14px;"><strong>* Lưu ý:</strong> Vui lòng đến sớm hơn 10 phút để thực hiện thủ tục Check-in hoặc tự Check-in tại quầy điện tử của phòng khám nhé.</p>
                        <p>Hẹn gặp lại bạn!</p>
                        
                        <div class="footer">
                            <p>© 2026 ${process.env.SMTP_FROM_NAME || 'Dental CMS'}. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail(email, subject, html);
    }

    // --- HÀM MỚI BỔ SUNG: GỬI EMAIL NHẮC HẸN (CRON JOB SẼ GỌI HÀM NÀY) ---
    async sendAppointmentReminder(appointment) {
        if (!appointment || !appointment.email) return;

        const subject = `⏳ Nhắc nhở lịch hẹn khám: ${appointment.appointment_time} hôm nay`;
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #ff9966 0%, #ff5e62 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .info-box { background: white; border-left: 4px solid #ff5e62; padding: 20px; margin: 20px 0; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
                    .info-table { width: 100%; border-collapse: collapse; }
                    .info-table td { padding: 10px 0; border-bottom: 1px solid #eee; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0;">⏳ Nhắc Nhở Lịch Hẹn</h1>
                    </div>
                    <div class="content">
                        <p>Xin chào <strong>${appointment.full_name}</strong>,</p>
                        <p><strong>${process.env.SMTP_FROM_NAME || 'Dental CMS'}</strong> xin thông báo nhắc nhở bạn về lịch hẹn khám nha khoa sắp diễn ra vào hôm nay.</p>
                        
                        <div class="info-box">
                            <table class="info-table">
                                <tr>
                                    <td><strong>Thời gian hẹn:</strong></td>
                                    <td style="text-align: right; color: #ff5e62; font-weight: bold;">${appointment.appointment_time} - Hôm nay</td>
                                </tr>
                                <tr>
                                    <td><strong>Số điện thoại:</strong></td>
                                    <td style="text-align: right; color: #333;">${appointment.phone}</td>
                                </tr>
                                <tr>
                                    <td><strong>Lý do khám:</strong></td>
                                    <td style="text-align: right; color: #333;">${appointment.reason || 'Không có ghi chú'}</td>
                                </tr>
                            </table>
                        </div>
                        
                        <p style="color: #d9534f; font-size: 14px;"><strong>* Lưu ý:</strong> Vui lòng đến phòng khám trước 5-10 phút để làm thủ tục. Nếu bạn cần thay đổi lịch, xin vui lòng liên hệ lại với chúng tôi sớm nhất có thể.</p>
                        <p>Hẹn gặp lại bạn!</p>
                        
                        <div class="footer">
                            <p style="margin-bottom: 5px;">Đây là email tự động. Vui lòng không trả lời email này.</p>
                            <p>© 2026 ${process.env.SMTP_FROM_NAME || 'Dental CMS'}. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail(appointment.email, subject, html);
    }

    async sendWelcomeGoogleAuthEmail(email, setupToken, userName = '') {
        const setupLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/set-password?token=${setupToken}&email=${email}`;
        const subject = 'Chào mừng bạn đến với Dental Clinic Management System';
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
                    .content { padding: 40px; }
                    .welcome-text { font-size: 24px; color: #4a5568; margin-bottom: 20px; text-align: center; }
                    .description { color: #718096; line-height: 1.8; margin-bottom: 30px; text-align: center; }
                    .button-container { text-align: center; margin: 40px 0; }
                    .setup-button { 
                        display: inline-block;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white !important;
                        padding: 16px 45px;
                        text-decoration: none;
                        border-radius: 50px;
                        font-size: 18px;
                        font-weight: 600;
                        transition: transform 0.2s;
                    }
                    .footer { background-color: #f7fafc; padding: 20px; text-align: center; color: #a0aec0; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin:0;"> Chào mừng bạn </h1>
                    </div>
                    <div class="content">
                        <h2 class="welcome-text">Xin chào ${userName || email}!</h2>
                        <p class="description">
                            Cảm ơn bạn đã tham gia cùng <strong>Dental CMS</strong>. Bạn đã đăng nhập thành công bằng tài khoản Google.<br><br>
                            Để có thể đăng nhập bằng mật khẩu thông thường trong tương lai, vui lòng nhấn nút bên dưới để thiết lập mật khẩu của riêng bạn:
                        </p>
                        
                        <div class="button-container">
                            <a href="${setupLink}" class="setup-button">
                                Thiết lập Mật khẩu ngay
                            </a>
                        </div>
                        
                        <p style="text-align: center; color: #a0aec0; font-size: 14px;">
                            Link này có hiệu lực trong vòng 24 giờ.
                        </p>
                    </div>
                    <div class="footer">
                        <p>© 2026 Dental Clinic Management System. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return this.sendEmail(email, subject, html);
    }

    // Email thông báo lễ tân đã XÁC NHẬN yêu cầu đổi lịch
    async sendAppointmentUpdateApprovedEmail(email, patientName, date, time) {
        if (!email) return;
        const subject = 'Lịch hẹn đã được xác nhận - Dental Clinic Management System';
        const clinicName = process.env.SMTP_FROM_NAME || 'Dental CMS';
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .info-box { background: white; border-left: 4px solid #11998e; padding: 20px; margin: 20px 0; border-radius: 4px; }
                    .info-table { width: 100%; border-collapse: collapse; }
                    .info-table td { padding: 10px 0; border-bottom: 1px solid #eee; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0;">Lịch hẹn đã được xác nhận</h1>
                    </div>
                    <div class="content">
                        <p>Xin chào <strong>${patientName}</strong>,</p>
                        <p>Yêu cầu đổi lịch khám của bạn đã được phòng khám <strong>${clinicName}</strong> xác nhận.</p>
                        <div class="info-box">
                            <table class="info-table">
                                <tr>
                                    <td><strong>Ngày khám:</strong></td>
                                    <td style="text-align: right; color: #11998e; font-weight: bold;">${date}</td>
                                </tr>
                                <tr>
                                    <td><strong>Giờ dự kiến:</strong></td>
                                    <td style="text-align: right; color: #11998e; font-weight: bold;">${time}</td>
                                </tr>
                            </table>
                        </div>
                        <p style="color: #d9534f; font-size: 14px;"><strong>* Lưu ý:</strong> Vui lòng đến sớm hơn 10 phút để thực hiện thủ tục Check-in.</p>
                        <p>Hẹn gặp lại bạn!</p>
                        <div class="footer"><p>© 2026 ${clinicName}. All rights reserved.</p></div>
                    </div>
                </div>
            </body>
            </html>
        `;
        return this.sendEmail(email, subject, html);
    }

    // Email thông báo lễ tân đã TỪ CHỐI yêu cầu đổi lịch
    async sendAppointmentUpdateRejectedEmail(email, patientName, date, time) {
        if (!email) return;
        const subject = 'Yêu cầu đổi lịch không được chấp nhận - Dental Clinic Management System';
        const clinicName = process.env.SMTP_FROM_NAME || 'Dental CMS';
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .info-box { background: white; border-left: 4px solid #f5576c; padding: 20px; margin: 20px 0; border-radius: 4px; }
                    .info-table { width: 100%; border-collapse: collapse; }
                    .info-table td { padding: 10px 0; border-bottom: 1px solid #eee; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0;">Yêu cầu đổi lịch không được chấp nhận</h1>
                    </div>
                    <div class="content">
                        <p>Xin chào <strong>${patientName}</strong>,</p>
                        <p>Rất tiếc, yêu cầu đổi lịch khám của bạn vào khung giờ dưới đây chưa phù hợp và không được phòng khám chấp nhận:</p>
                        <div class="info-box">
                            <table class="info-table">
                                <tr>
                                    <td><strong>Ngày đề xuất:</strong></td>
                                    <td style="text-align: right; color: #f5576c; font-weight: bold;">${date}</td>
                                </tr>
                                <tr>
                                    <td><strong>Giờ đề xuất:</strong></td>
                                    <td style="text-align: right; color: #f5576c; font-weight: bold;">${time}</td>
                                </tr>
                            </table>
                        </div>
                        <p>Vui lòng <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/appointments" style="color:#f5576c;">đặt lại lịch khám</a> với thời gian khác phù hợp hơn, hoặc liên hệ trực tiếp với phòng khám để được hỗ trợ.</p>
                        <p>Xin lỗi vì sự bất tiện này. Cảm ơn bạn đã thông cảm!</p>
                        <div class="footer"><p>© 2026 ${clinicName}. All rights reserved.</p></div>
                    </div>
                </div>
            </body>
            </html>
        `;
        return this.sendEmail(email, subject, html);
    }

    // Email thông báo Lễ tân/Phòng khám chủ động ĐỔI LỊCH của bệnh nhân
    async sendAppointmentRescheduledByClinicEmail(email, patientName, oldDate, oldTime, newDate, newTime) {
        if (!email) return;
        const subject = 'Thông báo: Thay đổi lịch hẹn khám - Dental Clinic Management System';
        const clinicName = process.env.SMTP_FROM_NAME || 'Dental CMS';
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #f6d365 0%, #fda085 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .info-box { background: white; border-left: 4px solid #f6d365; padding: 20px; margin: 20px 0; border-radius: 4px; }
                    .info-table { width: 100%; border-collapse: collapse; }
                    .info-table td { padding: 10px 0; border-bottom: 1px solid #eee; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0;">Thay đổi lịch hẹn</h1>
                    </div>
                    <div class="content">
                        <p>Xin chào <strong>${patientName}</strong>,</p>
                        <p>Phòng khám <strong>${clinicName}</strong> xin thông báo lịch hẹn của bạn đã được dời sang thời gian mới.</p>
                        <div class="info-box">
                            <table class="info-table">
                                <tr>
                                    <td><strong>Lịch hẹn cũ:</strong></td>
                                    <td style="text-align: right; color: #999; text-decoration: line-through;">${oldDate} - ${oldTime}</td>
                                </tr>
                                <tr>
                                    <td><strong>Lịch hẹn MỚI:</strong></td>
                                    <td style="text-align: right; color: #221f15ff; font-weight: bold;">${newDate} - ${newTime}</td>
                                </tr>
                            </table>
                        </div>
                        <p>Chúng tôi rất xin lỗi nếu sự thay đổi này gây bất tiện cho bạn. Nếu bạn không thể đến vào khung giờ mới, vui lòng liên hệ lại với phòng khám để được hỗ trợ sắp xếp lịch khác phù hợp hơn.</p>
                        <p>Xin cảm ơn và hẹn gặp lại!</p>
                        <div class="footer"><p>© 2026 ${clinicName}. All rights reserved.</p></div>
                    </div>
                </div>
            </body>
            </html>
        `;
        return this.sendEmail(email, subject, html);
    }

    // Email thông báo lịch hẹn đã bị HỦY (trường hợp thông thường)
    async sendAppointmentCancelledEmail(email, patientName, date, time) {
        if (!email) return;
        const subject = 'Thông báo: Lịch hẹn đã bị hủy - Dental Clinic Management System';
        const clinicName = process.env.SMTP_FROM_NAME || 'Dental CMS';
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #606c88 0%, #3f4c6b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .info-box { background: white; border-left: 4px solid #606c88; padding: 20px; margin: 20px 0; border-radius: 4px; }
                    .info-table { width: 100%; border-collapse: collapse; }
                    .info-table td { padding: 10px 0; border-bottom: 1px solid #eee; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0;">Lịch hẹn đã bị hủy</h1>
                    </div>
                    <div class="content">
                        <p>Xin chào <strong>${patientName}</strong>,</p>
                        <p>Chúng tôi gửi email này để thông báo rằng lịch hẹn khám của bạn tại <strong>${clinicName}</strong> đã bị hủy.</p>
                        <div class="info-box">
                            <table class="info-table">
                                <tr>
                                    <td><strong>Ngày hẹn:</strong></td>
                                    <td style="text-align: right; color: #3f4c6b; font-weight: bold;">${date}</td>
                                </tr>
                                <tr>
                                    <td><strong>Giờ hẹn:</strong></td>
                                    <td style="text-align: right; color: #3f4c6b; font-weight: bold;">${time}</td>
                                </tr>
                            </table>
                        </div>
                        <p>Nếu đây là một sự nhầm lẫn hoặc bạn muốn đặt lại lịch khám mới, vui lòng truy cập trang web của chúng tôi hoặc liên hệ trực tiếp với phòng khám để được hỗ trợ.</p>
                        <p>Cảm ơn bạn!</p>
                        <div class="footer"><p>© 2026 ${clinicName}. All rights reserved.</p></div>
                    </div>
                </div>
            </body>
            </html>
        `;
        return this.sendEmail(email, subject, html);
    }

    async sendNoShowEmail(email, patientName, date, time) {
        if (!email) return;
        const subject = 'Thông báo: Lịch hẹn vắng mặt - Dental Clinic Management System';
        const clinicName = process.env.SMTP_FROM_NAME || 'Dental CMS';
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #FF4B2B 0%, #FF416C 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .info-box { background: white; border-left: 4px solid #FF4B2B; padding: 20px; margin: 20px 0; border-radius: 4px; }
                    .info-table { width: 100%; border-collapse: collapse; }
                    .info-table td { padding: 10px 0; border-bottom: 1px solid #eee; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0;">Thông báo vắng mặt</h1>
                    </div>
                    <div class="content">
                        <p>Xin chào <strong>${patientName}</strong>,</p>
                        <p>Chúng tôi nhận thấy bạn đã không có mặt cho lịch hẹn tại <strong>${clinicName}</strong>.</p>
                        <div class="info-box">
                            <table class="info-table">
                                <tr>
                                    <td><strong>Ngày hẹn:</strong></td>
                                    <td style="text-align: right; color: #FF4B2B; font-weight: bold;">${date}</td>
                                </tr>
                                <tr>
                                    <td><strong>Giờ hẹn:</strong></td>
                                    <td style="text-align: right; color: #FF4B2B; font-weight: bold;">${time}</td>
                                </tr>
                            </table>
                        </div>
                        <p>Vì vậy, hệ thống đã tự động cập nhật trạng thái lịch hẹn của bạn là <strong>Vắng mặt (No Show)</strong>.</p>
                        <p>Nếu bạn muốn đặt lại lịch khám mới, vui lòng truy cập trang web của chúng tôi hoặc liên hệ trực tiếp với phòng khám.</p>
                        <p>Xin cảm ơn!</p>
                        <div class="footer"><p>© 2026 ${clinicName}. All rights reserved.</p></div>
                    </div>
                </div>
            </body>
            </html>
        `;
        return this.sendEmail(email, subject, html);
    }

    async sendEmail(to, subject, html) {
        try {
            logger.info(`[EmailService] Sending email to ${to} with subject "${subject}"`);
            const info = await this.transporter.sendMail({
                from: `"${process.env.SMTP_FROM_NAME || 'Dental CMS'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
                to,
                subject,
                html
            });

            logger.info(' Email sent successfully:', info.messageId);
            return info;
        } catch (error) {
            logger.error(' Error sending email:', error);
            throw new Error('Failed to send email: ' + error.message);
        }
    }
}

module.exports = new EmailService();