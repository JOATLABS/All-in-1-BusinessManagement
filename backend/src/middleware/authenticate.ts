import type { NextFunction, Request, Response } from 'express';
import { getSession } from '../services/sessionService.js';
import type { Session } from '../types.js';

declare global {
  namespace Express {
    interface Request {
      adminSession?: Session;
    }
  }
}

export const authenticateRequest = (req: Request, res: Response, next: NextFunction) => {
  const header = req.header('Authorization');
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing authorization token' });
  }

  const token = header.slice(7).trim();
  if (!token) {
    return res.status(401).json({ message: 'Missing authorization token' });
  }

  const session = getSession(token);
  if (!session) {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }

  req.adminSession = session;
  return next();
};
