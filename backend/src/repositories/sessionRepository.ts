import { eq, and, lt } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { db } from '../db/index.js';
import { adminUserSessionsTable, type AdminUserSessionRow } from '../db/schema.js';

/**
 * Session Repository
 * Manages admin user refresh token sessions in the database
 */
export class SessionRepository {
  /**
   * Create a new session with hashed refresh token
   */
  static async createSession(data: {
    adminUserId: string;
    refreshToken: string;
    ipAddress?: string;
    userAgent?: string;
    expiresAt: Date;
  }): Promise<AdminUserSessionRow> {
    // Hash the refresh token before storing
    const refreshTokenHash = await bcrypt.hash(data.refreshToken, 10);

    const [session] = await db
      .insert(adminUserSessionsTable)
      .values({
        adminUserId: data.adminUserId,
        refreshTokenHash,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        expiresAt: data.expiresAt,
      })
      .returning();

    return session;
  }

  /**
   * Find session by user ID and verify refresh token
   * Returns session if token matches, null otherwise
   */
  static async verifyRefreshToken(
    userId: string,
    refreshToken: string
  ): Promise<AdminUserSessionRow | null> {
    // Get all active sessions for this user
    const sessions = await db
      .select()
      .from(adminUserSessionsTable)
      .where(
        and(
          eq(adminUserSessionsTable.adminUserId, userId),
          lt(new Date(), adminUserSessionsTable.expiresAt) // Not expired
        )
      );

    // Check each session's hashed token
    for (const session of sessions) {
      const isMatch = await bcrypt.compare(refreshToken, session.refreshTokenHash);
      if (isMatch) {
        return session;
      }
    }

    return null;
  }

  /**
   * Update session's last used timestamp
   */
  static async updateLastUsed(sessionId: string): Promise<void> {
    await db
      .update(adminUserSessionsTable)
      .set({ lastUsedAt: new Date() })
      .where(eq(adminUserSessionsTable.id, sessionId));
  }

  /**
   * Delete a specific session (logout)
   */
  static async deleteSession(sessionId: string): Promise<void> {
    await db.delete(adminUserSessionsTable).where(eq(adminUserSessionsTable.id, sessionId));
  }

  /**
   * Delete all sessions for a user (logout from all devices)
   */
  static async deleteAllUserSessions(userId: string): Promise<void> {
    await db.delete(adminUserSessionsTable).where(eq(adminUserSessionsTable.adminUserId, userId));
  }

  /**
   * Delete expired sessions (cleanup task)
   */
  static async deleteExpiredSessions(): Promise<number> {
    const result = await db
      .delete(adminUserSessionsTable)
      .where(lt(adminUserSessionsTable.expiresAt, new Date()))
      .returning();

    return result.length;
  }

  /**
   * Get all active sessions for a user
   */
  static async getUserSessions(userId: string): Promise<AdminUserSessionRow[]> {
    return await db
      .select()
      .from(adminUserSessionsTable)
      .where(
        and(
          eq(adminUserSessionsTable.adminUserId, userId),
          lt(new Date(), adminUserSessionsTable.expiresAt)
        )
      );
  }

  /**
   * Count active sessions for a user
   */
  static async countUserSessions(userId: string): Promise<number> {
    const sessions = await this.getUserSessions(userId);
    return sessions.length;
  }
}
