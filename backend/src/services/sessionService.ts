import { randomUUID } from 'node:crypto';
import type { Session } from '../types.js';
import { config } from '../config.js';

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
