const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const logger = require('./common/utils/logger');

const app = express();
app.set('trust proxy', true);

// Override stream của Morgan để bắn log vào Winston thay vì console.log
const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  {
    stream: {
      // Configure Morgan to use our custom logger with the http severity
      write: (message) => logger.info(message.trim()),
    },
  }
);


app.use(morganMiddleware);

// CORS Configuration
const corsOptions = {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Swagger Documentation
const swaggerDocs = require('./config/swagger');
swaggerDocs(app);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check if the server is running
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Server is running
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes
const { authRoutes } = require('./modules/auth');
app.use('/api/auth', authRoutes);

const { clinicRoute } = require('./modules/clinic');
app.use('/api/clinic', clinicRoute);

const { roomRoute } = require('./modules/room');
app.use('/api/room', roomRoute);

const { equipmentRoute } = require('./modules/equipment');
app.use('/api/equipment', equipmentRoute);

const { serviceRoute } = require('./modules/service');
app.use('/api/service', serviceRoute);

// 404 Handler - Must be after all routes
app.use((req, res, next) => {
    res.status(404).json({
        status: 'error',
        message: `Route ${req.originalUrl} not found`
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Error:', err);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        status: 'error',
        message: message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});

module.exports = app;
