import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorResponse } from '../types/errors';
import logger from '../config/logger';
import { v4 as uuidv4 } from 'uuid';

// Extend Request interface to include requestId
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

// Request ID middleware
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  req.requestId = uuidv4();
  res.setHeader('X-Request-ID', req.requestId);
  next();
};

// HTTP request logging middleware
export const httpLoggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    };
    
    if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.http('HTTP Request', logData);
    }
  });
  
  next();
};

// Main error handling middleware
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let appError: AppError;

  // Convert known errors to AppError
  if (error instanceof AppError) {
    appError = error;
  } else if (error.name === 'ValidationError') {
    appError = new AppError(error.message, 400, 'VALIDATION_ERROR');
  } else if (error.name === 'JsonWebTokenError') {
    appError = new AppError('Invalid token', 401, 'INVALID_TOKEN');
  } else if (error.name === 'TokenExpiredError') {
    appError = new AppError('Token expired', 401, 'TOKEN_EXPIRED');
  } else if (error.name === 'CastError') {
    appError = new AppError('Invalid ID format', 400, 'INVALID_ID_FORMAT');
  } else {
    // Unknown error - log full details and return generic message
    appError = new AppError(
      'Internal server error',
      500,
      'INTERNAL_SERVER_ERROR',
      false
    );
  }

  // Log error details
  const errorLog = {
    requestId: req.requestId,
    error: {
      name: error.name,
      message: error.message,
      code: appError.code,
      statusCode: appError.statusCode,
      stack: error.stack,
      isOperational: appError.isOperational,
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query,
    },
  };

  if (appError.statusCode >= 500) {
    logger.error('Server Error', errorLog);
  } else {
    logger.warn('Client Error', errorLog);
  }

  // Prepare error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code: appError.code,
      message: appError.isOperational ? appError.message : 'Internal server error',
      timestamp: new Date().toISOString(),
      requestId: req.requestId,
    },
  };

  // Include details only in development or for operational errors
  if (process.env.NODE_ENV === 'development' || appError.isOperational) {
    errorResponse.error.details = appError.details;
  }

  res.status(appError.statusCode).json(errorResponse);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    404,
    'ROUTE_NOT_FOUND'
  );
  next(error);
};

// Unhandled promise rejection handler
export const handleUnhandledRejection = () => {
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('Unhandled Promise Rejection', {
      reason: reason?.message || reason,
      stack: reason?.stack,
      promise,
    });
    
    // Graceful shutdown
    process.exit(1);
  });
};

// Uncaught exception handler
export const handleUncaughtException = () => {
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    
    // Graceful shutdown
    process.exit(1);
  });
};