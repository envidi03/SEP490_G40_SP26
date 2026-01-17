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
                    .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
                    .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Email Verification</h1>
                    </div>
                    <div class="content">
                        <p>Hello${userName ? ' ' + userName : ''},</p>
                        <p>Thank you for registering with DentalCMS! Please use the following OTP code to verify your email address:</p>
                        <div class="otp-box">
                            <div class="otp-code">${verificationToken}</div>
                        </div>
                        <p>This code will expire in ${process.env.OTP_EXPIRES_MINUTES || 15} minutes.</p>
                        <p>If you didn't request this verification, please ignore this email.</p>
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