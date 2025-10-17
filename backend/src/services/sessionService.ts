import { randomUUID } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import type { Session } from '../types.js';
import { config } from '../config.js';

declare global {
  namespace Express {
    interface Request {
      session?: Session;
    }
  }
}

const sessions = new Map<string, Session>();

const isExpired = (session: Session) => session.expiresAt <= Date.now();

export const createSession = (payload: Omit<Session, 'token' | 'expiresAt'>): Session => {
  const token = randomUUID();
  const session: Session = {
    ...payload,
    token,
    expiresAt: Date.now() + config.sessionTtlMs
  };
  sessions.set(token, session);
  return session;
};

export const getSession = (token: string): Session | null => {
  const session = sessions.get(token);
  if (!session) {
    return null;
  }

  if (isExpired(session)) {
    sessions.delete(token);
    return null;
  }

  return session;
};

export const revokeSession = (token: string): void => {
  sessions.delete(token);
};

/**
 * Express middleware to require authentication
 * Single-tenant: validates session token only (no tenant context)
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.substring(7);
  const session = getSession(token);

  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  // Attach session to request for use in route handlers
  req.session = session;
  next();
};
