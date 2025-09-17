import logger from './logger.js';

// Custom error classes
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Database operation failed') {
    super(message, 500);
    this.name = 'DatabaseError';
  }
}

// Error handling utilities
export const handleAsync = fn => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const handleMongooseError = error => {
  let message = 'Database error occurred';
  let statusCode = 500;

  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    message = `Validation Error: ${errors.join(', ')}`;
    statusCode = 400;
  } else if (error.name === 'CastError') {
    message = `Invalid ${error.path}: ${error.value}`;
    statusCode = 400;
  } else if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    message = `${field} already exists`;
    statusCode = 409;
  } else if (error.name === 'JsonWebTokenError') {
    message = 'Invalid token';
    statusCode = 401;
  } else if (error.name === 'TokenExpiredError') {
    message = 'Token expired';
    statusCode = 401;
  }

  return new AppError(message, statusCode);
};

export const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

export const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or other unknown error: don't leak error details
    logger.error('ERROR 💥', err);

    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

export const globalErrorHandler = (err, req, res, _next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    if (err.name === 'CastError') { error = handleMongooseError(error); }
    if (err.code === 11000) { error = handleMongooseError(error); }
    if (err.name === 'ValidationError') { error = handleMongooseError(error); }
    if (err.name === 'JsonWebTokenError') { error = handleMongooseError(error); }
    if (err.name === 'TokenExpiredError') { error = handleMongooseError(error); }

    sendErrorProd(error, res);
  }
};

// 404 handler
export const notFound = (req, res, next) => {
  const error = new NotFoundError(`Not found - ${req.originalUrl}`);
  next(error);
};
