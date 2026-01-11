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

    async sendMailVerificationEmail(email, otp, userName = '') {
        const subject = 'Verify Your Email - Booking App';
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
                        <p>Thank you for registering with Booking App! Please use the following OTP code to verify your email address:</p>
                        <div class="otp-box">
                            <div class="otp-code">${otp}</div>
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


}