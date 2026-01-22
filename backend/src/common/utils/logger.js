const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Lấy môi trường hiện tại
const env = process.env.NODE_ENV || 'development';

// 1. Định dạng log cho môi trường DEV
// Mục tiêu: Dễ đọc mắt thường, hiện stack trace nếu có lỗi
const devFormat = winston.format.combine(
  winston.format.colorize(), 
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.errors({ stack: true }), // Quan trọng: Cho phép in ra stack trace
  winston.format.printf(({ timestamp, level, message, stack, context }) => {
    // Hiển thị: Thời gian [Level] [Context]: Message
    let logMsg = `${timestamp} [${level}]${context ? ` [${context}]` : ''}: ${message}`;
    
    // Nếu có stack trace (lỗi), xuống dòng và in ra
    if (stack) {
        logMsg += `\n${stack}`;
    }
    return logMsg;
  })
);

// 2. Định dạng log cho môi trường PROD
// Mục tiêu: JSON đầy đủ để nạp vào ELK/Splunk, bao gồm cả stack trace
const prodFormat = winston.format.combine(
  winston.format.timestamp(), // Mặc định là ISO format (2026-01-21T...)
  winston.format.errors({ stack: true }), // Quan trọng: Tự động trích xuất stack từ Error object
  winston.format.json() // Chuyển tất cả thành JSON
);

// 3. Cấu hình ghi log ra file (cho Production)
const fileRotateTransport = new DailyRotateFile({
  filename: path.join(__dirname, '../../logs', 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'info',
});

// Khởi tạo Logger
const logger = winston.createLogger({
  level: env === 'development' ? 'debug' : 'info',
  // Mặc định format chung (sẽ bị override bởi transport nếu cần)
  format: env === 'development' ? devFormat : prodFormat,
  transports: [
    // Console Transport
    new winston.transports.Console({
      format: env === 'development' ? devFormat : prodFormat 
    }),
  ],
});

// Nếu là Production, thêm transport ghi file
if (env !== 'development') {
  logger.add(fileRotateTransport);
}

module.exports = logger;