import winston from 'winston';
import { env } from './env.js';

/**
 * Structured Logger Configuration
 * Uses Winston for JSON-formatted logs with levels and metadata
 */

const { combine, timestamp, errors, json, printf, colorize } = winston.format;

// Custom format for console output in development
const consoleFormat = printf(({ level, message, timestamp, requestId, userId, ...meta }) => {
  let log = `${timestamp} [${level}]`;

  if (requestId) {
    log += ` [${requestId}]`;
  }

  if (userId) {
    log += ` [user:${userId}]`;
  }

  log += `: ${message}`;

  // Add metadata if present
  const metaKeys = Object.keys(meta);
  if (metaKeys.length > 0) {
    log += ` ${JSON.stringify(meta)}`;
  }

  return log;
});

// Create Winston logger
export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: combine(
    errors({ stack: true }), // Log full stack trace
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
  ),
  defaultMeta: {
    service: 'ojaplus-backend',
    environment: env.NODE_ENV,
  },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: combine(
        colorize(),
        env.NODE_ENV === 'production' ? json() : consoleFormat
      ),
    }),
  ],
});

// Add file transports in production
if (env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: json(),
    })
  );

  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: json(),
    })
  );
}

/**
 * Logger methods with context support
 */
export interface LogContext {
  requestId?: string;
  userId?: string;
  action?: string;
  [key: string]: any;
}

export const log = {
  info: (message: string, context?: LogContext) => {
    logger.info(message, context);
  },

  error: (message: string, error?: Error | unknown, context?: LogContext) => {
    if (error instanceof Error) {
      logger.error(message, {
        ...context,
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
      });
    } else {
      logger.error(message, { ...context, error });
    }
  },

  warn: (message: string, context?: LogContext) => {
    logger.warn(message, context);
  },

  debug: (message: string, context?: LogContext) => {
    logger.debug(message, context);
  },

  http: (message: string, context?: LogContext) => {
    logger.http(message, context);
  },
};

// Export types
export type Logger = typeof log;
