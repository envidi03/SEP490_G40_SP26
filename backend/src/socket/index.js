const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io = null;

/**
 * Khởi tạo Socket.IO server và gắn vào HTTP server.
 * Gọi hàm này 1 lần duy nhất trong server.js khi khởi động.
 * @param {http.Server} httpServer - HTTP Server từ app.listen()
 * @param {object} corsOptions - Cấu hình CORS dùng chung với Express
 */
const initSocket = (httpServer, corsOptions) => {
    io = new Server(httpServer, {
        cors: corsOptions,
        transports: ['websocket', 'polling'],
    });

    // ── Middleware: Xác thực JWT cho mỗi kết nối Socket.IO ──
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token
            || socket.handshake.headers?.authorization?.replace('Bearer ', '');

        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // Lưu thông tin user vào socket để dùng ở các listener
            socket.user = decoded;
            next();
        } catch (err) {
            return next(new Error('Authentication error: Invalid token'));
        }
    });

    // ── Xử lý kết nối ──
    io.on('connection', (socket) => {
        const userId = socket.user?.account_id || socket.user?.id || socket.user?._id;
        const role   = socket.user?.role;

        console.log(`🔌 [Socket] User connected: ${userId} (role: ${role}) - socketId: ${socket.id}`);

        // Mỗi user join vào room riêng theo userId để gửi thông báo cá nhân
        if (userId) {
            socket.join(`user:${userId}`);
        }

        // Các role có thể join thêm room theo nhóm để nhận broadcast theo vai trò
        // Ví dụ: tất cả receptionist cùng nhận thông báo "có lịch hẹn mới"
        if (role) {
            socket.join(`role:${role}`);
        }

        socket.on('disconnect', (reason) => {
            console.log(`🔌 [Socket] User disconnected: ${userId} - Reason: ${reason}`);
        });
    });

    console.log('✅ Socket.IO initialized');
    return io;
};

/**
 * Lấy instance của Socket.IO (dùng ở các service khác để emit event).
 * @returns {Server} - Socket.IO Server instance
 */
const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO has not been initialized. Call initSocket() first.');
    }
    return io;
};

/**
 * Gửi thông báo đến một user cụ thể theo userId.
 * @param {string} userId
 * @param {string} event - Tên event (vd: 'new_notification')
 * @param {object} data  - Dữ liệu đính kèm
 */
const emitToUser = (userId, event, data) => {
    getIO().to(`user:${userId}`).emit(event, data);
};

/**
 * Gửi thông báo đến tất cả user có cùng role.
 * @param {string} role  - Tên role (vd: 'receptionist', 'doctor', 'pharmacist', 'admin')
 * @param {string} event - Tên event
 * @param {object} data  - Dữ liệu đính kèm
 */
const emitToRole = (role, event, data) => {
    getIO().to(`role:${role}`).emit(event, data);
};

module.exports = { initSocket, getIO, emitToUser, emitToRole };
