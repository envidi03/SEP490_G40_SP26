const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Lấy môi trường hiện tại
const env = process.env.NODE_ENV || 'development';
// 1. Định dạng log cho môi trường DEV
const devFormat = winston.format.combine(
  winston.format.colorize(), 
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, context, ...metadata }) => {
    // In dòng tiêu đề log
    let logMsg = `${timestamp} [${level}]${context ? ` [${context}]` : ''}: ${message}`;
    
    // NẾU CÓ DỮ LIỆU PHỤ (metadata): Chuyển thành chuỗi JSON đẹp để hiển thị
    if (Object.keys(metadata).length > 0) {
      // metadata ở đây sẽ chứa: query, rooms, roomData, cleanUpdateData... tùy theo chỗ gọi
      logMsg += `\n${JSON.stringify(metadata, null, 2)}`;
    }
    
    // In stack trace nếu là log lỗi
    if (stack) {
        logMsg += `\n${stack}`;
    }
    return logMsg;
  })
);

// 2. Định dạng log cho môi trường PROD
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  // Gom tất cả các field lạ vào một object 'metadata' để cấu trúc JSON gọn gàng
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'stack', 'context'] }),
  winston.format.json()
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