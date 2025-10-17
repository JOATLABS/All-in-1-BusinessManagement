import { Request, Response, NextFunction } from 'express';
import { log } from '../config/logger.js';
import { env } from '../config/env.js';

/**
 * Custom Application Error
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Common error types
 */
export class BadRequestError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message);
  }
}

export class ValidationError extends AppError {
  public readonly errors?: unknown;

  constructor(message: string, errors?: unknown) {
    super(422, message);
    this.errors = errors;
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal server error') {
    super(500, message, false); // Not operational
  }
}

/**
 * Centralized Error Handler Middleware
 * Catches all errors and returns consistent JSON responses
 */
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  void _next;
  const requestId = req.requestId || 'unknown';
  const userId = req.user?.userId;

  // Default error values
  let statusCode = 500;
  let message = 'An unexpected error occurred';
  let isOperational = false;

  // Handle known AppError types
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  }

  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    isOperational = true;
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    isOperational = true;
  }

  // Handle validation errors (Zod, etc.)
  else if (err.name === 'ZodError') {
    statusCode = 422;
    message = 'Validation failed';
    isOperational = true;
  }

  // Log error
  log.error(message, err, {
    requestId,
    userId,
    method: req.method,
    path: req.path,
    statusCode,
    isOperational,
  });

  // Send error response
  const errorResponse: Record<string, unknown> = {
    error: env.NODE_ENV === 'production' && !isOperational ? 'Internal server error' : message,
    requestId,
  };

  // Include stack trace in development
  if (env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  // Include validation errors if present
  if (err instanceof ValidationError && err.errors) {
    errorResponse.errors = err.errors;
  }

  res.status(statusCode).json(errorResponse);
}

/**
 * 404 Not Found Handler
 * Catches all unmatched routes
 */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new NotFoundError(`Route ${req.method} ${req.path} not found`));
}

/**
 * Async handler wrapper to catch errors in async route handlers
 */
// eslint-disable-next-line no-unused-vars
export function asyncHandler<T>(fn: (...handlerArgs: [Request, Response, NextFunction]) => Promise<T>) {
  return (...args: Parameters<typeof fn>) => {
    const nextFn = args[2];
    void fn(args[0], args[1], nextFn).catch(nextFn);
  };
}
