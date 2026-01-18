const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Lấy môi trường hiện tại (mặc định là development)
const env = process.env.NODE_ENV || 'development';

// 1. Định dạng log cho môi trường DEV (Dễ đọc, có màu sắc)
const devFormat = winston.format.combine(
  winston.format.colorize(), // Thêm màu: Info xanh, Error đỏ...
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level}]: ${message}`;
  })
);

// 2. Định dạng log cho môi trường PROD (JSON để máy đọc, ELK stack, Splunk...)
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json() // Output dạng JSON string
);

// 3. Cấu hình ghi log ra file (cho Production)
// Tự động tách file theo ngày, nén file cũ, xóa file cũ sau 14 ngày
const fileRotateTransport = new DailyRotateFile({
  filename: path.join(__dirname, '../../logs', 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true, // Nén file log cũ (.gz)
  maxSize: '20m',      // Kích thước tối đa mỗi file
  maxFiles: '14d',     // Giữ log trong 14 ngày
  level: 'info',       // Chỉ ghi từ mức Info trở lên (bỏ qua debug)
});

// Khởi tạo Logger
const logger = winston.createLogger({
  level: env === 'development' ? 'debug' : 'info',
  format: env === 'development' ? devFormat : prodFormat,
  transports: [
    // Luôn ghi ra Console (Terminal)
    new winston.transports.Console({
      // Nếu là PROD, console log vẫn nên là JSON để các tool như Docker/K8s/Azure Monitor dễ parse
      format: env === 'development' ? devFormat : prodFormat 
    }),
  ],
});

// Nếu là Production, thêm việc ghi vào File
if (env !== 'development') {
  logger.add(fileRotateTransport);
}

module.exports = logger;