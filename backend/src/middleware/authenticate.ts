import type { NextFunction, Request, Response } from 'express';
import { JWTService } from '../services/jwtService.js';
import { log } from '../config/logger.js';
import { UnauthorizedError } from './errorHandler.js';

/**
 * Authenticated User attached to request
 */
export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: 'superadmin' | 'admin' | 'staff';
  tokenId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * JWT Authentication Middleware
 * Validates JWT access tokens and attaches user to request
 */
export const authenticateRequest = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Extract token from Authorization header
    const header = req.header('Authorization');
    if (!header || !header.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing authorization token');
    }

    const token = header.slice(7).trim();
    if (!token) {
      throw new UnauthorizedError('Missing authorization token');
    }

    // Verify JWT token
    const payload = JWTService.verifyAccessToken(token);

    // Attach user to request
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      tokenId: payload.tokenId,
    };

    log.debug('User authenticated', {
      requestId: req.requestId,
      userId: payload.userId,
      role: payload.role,
    });

    next();
  } catch (error) {
    // Log authentication failure
    log.warn('Authentication failed', {
      requestId: req.requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      path: req.path,
    });

    // Pass error to error handler
    next(new UnauthorizedError(error instanceof Error ? error.message : 'Authentication failed'));
  }
};

/**
 * Optional authentication - attaches user if token is valid, but doesn't require it
 * Useful for endpoints that behave differently for authenticated users
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const header = req.header('Authorization');
    if (!header || !header.startsWith('Bearer ')) {
      return next();
    }

    const token = header.slice(7).trim();
    if (!token) {
      return next();
    }

    const payload = JWTService.verifyAccessToken(token);

    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      tokenId: payload.tokenId,
    };

    next();
  } catch {
    // Ignore authentication errors for optional auth
    next();
  }
};
