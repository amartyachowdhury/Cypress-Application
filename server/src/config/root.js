/**
 * Application Configuration
 * 
 * Centralized configuration for the entire application
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Environment configuration
export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5050,
  CLIENT_PORT: process.env.CLIENT_PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/cypress-app',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || '10mb',
  RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX || 100,
  AUTH_RATE_LIMIT_MAX: process.env.AUTH_RATE_LIMIT_MAX || 5,
  REPORT_RATE_LIMIT_MAX: process.env.REPORT_RATE_LIMIT_MAX || 10,
};

// Database configuration
export const database = {
  uri: env.MONGODB_URI,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
  },
};

// JWT configuration
export const jwt = {
  secret: env.JWT_SECRET,
  expiresIn: env.JWT_EXPIRES_IN,
  algorithm: 'HS256',
};

// CORS configuration
export const cors = {
  origin: env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Rate limiting configuration
export const rateLimit = {
  windowMs: env.RATE_LIMIT_WINDOW,
  max: env.RATE_LIMIT_MAX,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
};

// Auth rate limiting
export const authRateLimit = {
  windowMs: 60 * 60 * 1000, // 1 hour
  max: env.AUTH_RATE_LIMIT_MAX,
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
};

// Report rate limiting
export const reportRateLimit = {
  windowMs: 60 * 60 * 1000, // 1 hour
  max: env.REPORT_RATE_LIMIT_MAX,
  message: 'Too many reports submitted, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
};

// File upload configuration
export const upload = {
  path: env.UPLOAD_PATH,
  maxFileSize: env.MAX_FILE_SIZE,
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxFiles: 5,
};

// Logging configuration
export const logging = {
  level: env.NODE_ENV === 'production' ? 'warn' : 'debug',
  format: env.NODE_ENV === 'production' ? 'json' : 'simple',
  file: {
    error: 'logs/error.log',
    combined: 'logs/combined.log',
  },
};

// Email configuration (for future use)
export const email = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
};

// Socket.IO configuration
export const socket = {
  cors: {
    origin: env.CORS_ORIGIN,
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
};

// Application metadata
export const app = {
  name: 'Cypress Community Problem Reporting Application',
  version: '1.0.0',
  description: 'A full-stack MERN application for community problem reporting',
  author: 'Cypress Development Team',
  license: 'MIT',
};

export default {
  env,
  database,
  jwt,
  cors,
  rateLimit,
  authRateLimit,
  reportRateLimit,
  upload,
  logging,
  email,
  socket,
  app,
};
