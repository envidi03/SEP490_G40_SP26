const http = require('http');
const { app, corsOptions } = require('./app');
const connectDB = require('./config/dbConfig');
const { initSocket } = require('./socket');
const zaloService = require('./common/service/zalo.service');
require('dotenv').config();

// ============ SERVER CONFIGURATION ============

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Required for Render deployment

// ============ START SERVER ============

async function startServer() {
    try {
        // Kết nối Database
        console.log('🔌 Connecting to MongoDB...');
        const dbConnected = await connectDB();

        if (!dbConnected) {
            console.error('❌ Failed to connect to MongoDB. Server will not start.');
            process.exit(1);
        }

        console.log('✅ MongoDB connected successfully');

        // Khởi tạo Zalo Token — Seed từ .env vào DB lần đầu (nếu chưa có)
        zaloService.initTokens().catch(err => console.error('⚠️ Zalo token init failed:', err.message));

        // Tạo HTTP server bọc Express app (cần thiết để Socket.IO dùng chung port)
        const httpServer = http.createServer(app);

        // Khởi tạo Socket.IO gắn vào HTTP server
        initSocket(httpServer, corsOptions);

        // Khởi động Server
        httpServer.listen(PORT, HOST, () => {
            console.log('='.repeat(50));
            console.log(`🚀 Server is running on http://${HOST}:${PORT}`);
            console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || '*'}`);
            console.log(`🔌 Socket.IO ready`);
            console.log('='.repeat(50));
        });

        // Graceful Shutdown
        process.on('SIGTERM', () => {
            console.log('⚠️  SIGTERM signal received: closing HTTP server');
            httpServer.close(() => {
                console.log('✅ HTTP server closed');
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            console.log('\n⚠️  SIGINT signal received: closing HTTP server');
            httpServer.close(() => {
                console.log('✅ HTTP server closed');
                process.exit(0);
            });
        });

    } catch (error) {
        console.error('❌ Error starting server:', error);
        process.exit(1);
    }
}

// Khởi động server
startServer();
