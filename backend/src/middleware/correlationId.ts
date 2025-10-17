import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

/**
 * Correlation ID Middleware
 * Generates a unique ID for each request to trace logs across services
 */

// Extend Express Request type to include requestId
declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Use existing request ID from header, or generate new one
  const requestId = (req.get('X-Request-ID') as string) || randomUUID();

  // Attach to request object for use in route handlers
  req.requestId = requestId;

  // Add to response headers
  res.setHeader('X-Request-ID', requestId);

  next();
}
