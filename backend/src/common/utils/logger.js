const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Lấy môi trường hiện tại
const env = process.env.NODE_ENV || 'development';

// 1. Định dạng log cho màn hình Console (Luôn hiển thị đẹp, dễ đọc ở cả Local và Server)
const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, context, ...metadata }) => {
    // In dòng tiêu đề log
    let logMsg = `${timestamp} [${level}]${context ? ` [${context}]` : ''}: ${message}`;

    // NẾU CÓ DỮ LIỆU PHỤ (metadata): Chuyển thành chuỗi JSON đẹp để hiển thị nhiều dòng
    if (Object.keys(metadata).length > 0) {
      logMsg += `\n${JSON.stringify(metadata, null, 2)}`;
    }

    // In stack trace nếu là log lỗi
    if (stack) {
      logMsg += `\n${stack}`;
    }
    return logMsg;
  })
);

// 2. Định dạng log cho việc ghi File trên Production (Chuẩn JSON 1 dòng để tối ưu dung lượng)
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

// 4. Khởi tạo Logger
const logger = winston.createLogger({
  // Ở local thì hiện log debug, lên server thì chỉ hiện từ info trở lên cho đỡ rác
  level: env === 'development' ? 'debug' : 'info',

  transports: [
    // Luôn luôn in ra Terminal/Console (ở cả Local và Render) dạng đẹp mắt dễ đọc
    new winston.transports.Console({
      format: devFormat
    }),
  ],
});

// 5. Nếu là Production, mới bật tính năng ghi log ra file cất đi
if (env === 'production') {
  // Ép transport ghi file dùng định dạng nén JSON 1 dòng
  fileRotateTransport.format = prodFormat;
  logger.add(fileRotateTransport);
}

module.exports = logger;