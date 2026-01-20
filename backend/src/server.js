const app = require('./app');
const connectDB = require('./config/dbConfig');
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

        // Khởi động Server
        const server = app.listen(PORT, HOST, () => {
            console.log('='.repeat(50));
            console.log(`🚀 Server is running on http://${HOST}:${PORT}`);
            console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || '*'}`);
            console.log('='.repeat(50));
        });

        // Graceful Shutdown
        process.on('SIGTERM', () => {
            console.log('⚠️  SIGTERM signal received: closing HTTP server');
            server.close(() => {
                console.log('✅ HTTP server closed');
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            console.log('\n⚠️  SIGINT signal received: closing HTTP server');
            server.close(() => {
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
