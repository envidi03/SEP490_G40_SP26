const nodemailer = require('nodemailer')
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

    async sendEmail(to, subject, html) {
        try {
            const info = await this.transporter.sendMail({
                from: `"${process.env.SMTP_FROM_NAME || 'Dental CMS'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
                to,
                subject,
                html
            });

            console.log(' Email sent successfully:', info.messageId);
            return info;
        } catch (error) {
            console.error(' Error sending email:', error);
            throw new Error('Failed to send email: ' + error.message);
        }
    }
}

module.exports = new EmailService();