/**
 * Cypress Community Problem Reporting Application - Server
 * 
 * This is the main server application file that sets up and starts the server.
 */

import express from 'express';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { fileURLToPath } from 'url';

// Import configurations
import connectDB from './config/database.js';
import { env, cors as corsConfig, socket } from '/app/config/index.js';
import logger from './utils/logger.js';

// Import middleware
import {
  helmetConfig,
  corsConfig as securityCorsConfig,
  generalLimiter,
  authLimiter,
  reportLimiter,
  sanitizeRequest,
  securityHeaders,
} from './middleware/security.js';
import { globalErrorHandler, notFound } from './utils/errors.js';

// Load environment variables first
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, socket);

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmetConfig);
app.use(securityHeaders);
app.use(cors(securityCorsConfig));
app.use(compression());

// Rate limiting
app.use('/api/auth', authLimiter);
app.use('/api/reports', reportLimiter);
app.use(generalLimiter);

// Logging middleware
app.use(morgan('combined', { stream: logger.stream }));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request sanitization
app.use(sanitizeRequest);

// Static files
app.use(express.static(path.join(__dirname, 'uploads')));

// Store connected users
const connectedUsers = new Map();

// Socket.IO connection handling
io.on('connection', socket => {
  logger.info(`User connected: ${socket.id}`);

  // Handle user authentication
  socket.on('authenticate', userId => {
    connectedUsers.set(userId, socket.id);
    logger.info(`User ${userId} authenticated with socket ${socket.id}`);
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    // Remove user from connected users
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        logger.info(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Notification helper function
const sendNotification = (userId, notification) => {
  const socketId = connectedUsers.get(userId);
  if (socketId) {
    io.to(socketId).emit('notification', notification);
    logger.info(`Notification sent to user ${userId}:`, notification);
  }
};

// Make notification function available to routes
app.locals.sendNotification = sendNotification;

// Import routes
import authRoutes from './routes/authRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Test notification endpoint
app.post('/api/test-notification', (req, res) => {
  const { userId, message } = req.body;
  if (userId && message) {
    sendNotification(userId, {
      type: 'info',
      title: 'Test Notification',
      message: message,
      timestamp: new Date().toISOString(),
    });
    res.json({ success: true, message: 'Test notification sent' });
  } else {
    res.status(400).json({ error: 'userId and message are required' });
  }
});

// Connect to database
connectDB();

// 404 handler (must be before error handler)
app.use(notFound);

// Global error handling middleware (must be last)
app.use(globalErrorHandler);

const PORT = env.PORT;

server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info('📡 WebSocket server ready for real-time notifications');
  logger.info(`🌍 Environment: ${env.NODE_ENV}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', err => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', err => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    logger.info('💥 Process terminated!');
  });
});
