const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('=== Kiểm tra kết nối SMTP Local ===');
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'Đã thiết lập (16 ký tự)' : 'Chưa thiết lập');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

console.log('\nĐang thử kết nối tới Google SMTP...');

transporter.verify((error, success) => {
    if (error) {
        console.error('❌ LỖI KẾT NỐI:', error.message);
        if (error.message.includes('535-5.7.8')) {
            console.log('\n💡 Gợi ý: Google báo sai mật khẩu (BadCredentials).');
            console.log('Đảm bảo bạn đã dùng App Password và KHÔNG có dấu cách.');
        }
    } else {
        console.log('✅ THÀNH CÔNG: Server SMTP đã sẵn sàng gửi mail!');
    }
    process.exit();
});
