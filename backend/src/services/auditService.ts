import { getDb } from '../db/index.js';
import { auditLogsTable } from '../db/schema.js';
import type { Request } from 'express';
import { log } from '../config/logger.js';

/**
 * Audit Action Types
 */
export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'failed_login'
  | 'password_reset'
  | 'password_change'
  | 'token_refresh';

/**
 * Entity Types for Audit Logging
 */
export type EntityType =
  | 'admin_user'
  | 'event'
  | 'site_content'
  | 'reservation'
  | 'session'
  | 'media'
  | 'ticket'
  | 'customer';

/**
 * Audit Log Entry
 */
export interface AuditLogEntry {
  adminUserId?: string; // undefined for anonymous actions (failed login)
  action: AuditAction;
  entityType: EntityType;
  entityId?: string; // undefined for actions like login
  changes?: Record<string, unknown>; // before/after snapshots
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Audit Service
 * Tracks all admin actions for compliance, security, and debugging
 */
export class AuditService {
  /**
   * Log an audit event
   */
  static async log(entry: AuditLogEntry): Promise<void> {
    try {
      const db = getDb();

      await db.insert(auditLogsTable).values({
        adminUserId: entry.adminUserId || null,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId || null,
        changes: entry.changes || null,
        ipAddress: entry.ipAddress || null,
        userAgent: entry.userAgent || null,
      });
    } catch (error) {
      // Log to application logger if database logging fails (don't throw - audit shouldn't break the app)
      log.error('Failed to write audit log', error, {
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
      });
    }
  }

  /**
   * Log from Express request (extracts IP and user agent)
   */
  static async logFromRequest(req: Request, entry: Omit<AuditLogEntry, 'ipAddress' | 'userAgent'>): Promise<void> {
    await this.log({
      ...entry,
      ipAddress: this.extractIP(req),
      userAgent: req.get('user-agent'),
    });
  }

  /**
   * Log login attempt (success)
   */
  static async logLogin(userId: string, req: Request): Promise<void> {
    await this.logFromRequest(req, {
      adminUserId: userId,
      action: 'login',
      entityType: 'session',
    });
  }

  /**
   * Log failed login attempt
   */
  static async logFailedLogin(email: string, req: Request): Promise<void> {
    await this.logFromRequest(req, {
      action: 'failed_login',
      entityType: 'session',
      changes: { email }, // Store attempted email
    });
  }

  /**
   * Log logout
   */
  static async logLogout(userId: string, req: Request): Promise<void> {
    await this.logFromRequest(req, {
      adminUserId: userId,
      action: 'logout',
      entityType: 'session',
    });
  }

  /**
   * Log token refresh
   */
  static async logTokenRefresh(userId: string, req: Request): Promise<void> {
    await this.logFromRequest(req, {
      adminUserId: userId,
      action: 'token_refresh',
      entityType: 'session',
    });
  }

  /**
   * Log entity creation
   */
  static async logCreate(
    userId: string,
    entityType: EntityType,
    entityId: string,
    data: Record<string, unknown>,
    req: Request
  ): Promise<void> {
    await this.logFromRequest(req, {
      adminUserId: userId,
      action: 'create',
      entityType,
      entityId,
      changes: { after: data },
    });
  }

  /**
   * Log entity update
   */
  static async logUpdate(
    userId: string,
    entityType: EntityType,
    entityId: string,
    before: Record<string, unknown>,
    after: Record<string, unknown>,
    req: Request
  ): Promise<void> {
    await this.logFromRequest(req, {
      adminUserId: userId,
      action: 'update',
      entityType,
      entityId,
      changes: { before, after },
    });
  }

  /**
   * Log entity deletion
   */
  static async logDelete(
    userId: string,
    entityType: EntityType,
    entityId: string,
    data: Record<string, unknown>,
    req: Request
  ): Promise<void> {
    await this.logFromRequest(req, {
      adminUserId: userId,
      action: 'delete',
      entityType,
      entityId,
      changes: { before: data },
    });
  }

  /**
   * Log password reset request
   */
  static async logPasswordReset(userId: string, req: Request): Promise<void> {
    await this.logFromRequest(req, {
      adminUserId: userId,
      action: 'password_reset',
      entityType: 'admin_user',
      entityId: userId,
    });
  }

  /**
   * Log password change
   */
  static async logPasswordChange(userId: string, req: Request): Promise<void> {
    await this.logFromRequest(req, {
      adminUserId: userId,
      action: 'password_change',
      entityType: 'admin_user',
      entityId: userId,
    });
  }

  /**
   * Extract IP address from request (handles proxies)
   */
  private static extractIP(req: Request): string {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (req.headers['x-real-ip'] as string) ||
      req.ip ||
      req.socket.remoteAddress ||
      'unknown'
    );
  }
}
