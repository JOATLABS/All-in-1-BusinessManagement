import type { Router, Request, Response } from 'express';
import { authenticate, updateLastLogin } from '../services/authService.js';
import { loginSchema } from '../validation/auth.js';
import { JWTService } from '../services/jwtService.js';
import { SessionRepository } from '../repositories/sessionRepository.js';
import { AuditService } from '../services/auditService.js';
import { authenticateRequest } from '../middleware/authenticate.js';
import { asyncHandler, BadRequestError, UnauthorizedError } from '../middleware/errorHandler.js';
import { log } from '../config/logger.js';

export const registerAuthRoutes = (router: Router) => {
  /**
   * POST /auth/login
   * Authenticate user and return JWT tokens
   */
  router.post(
    '/auth/login',
    asyncHandler(async (req: Request, res: Response) => {
      // Validate request body
      const parseResult = loginSchema.safeParse(req.body);
      if (!parseResult.success) {
        throw new BadRequestError('Invalid credentials payload');
      }

      const credentials = parseResult.data;

      // Authenticate user
      const user = await authenticate(credentials.email, credentials.password);
      if (!user) {
        // Log failed login attempt
        await AuditService.logFailedLogin(credentials.email, req);
        throw new UnauthorizedError('Invalid email or password');
      }

      // Generate JWT token pair
      const { accessToken, refreshToken, expiresIn } = JWTService.generateTokenPair({
        id: user.id,
        email: user.email,
        role: user.role as 'superadmin' | 'admin' | 'staff',
      });

      // Store refresh token in database
      const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await SessionRepository.createSession({
        adminUserId: user.id,
        refreshToken,
        ipAddress: extractIP(req),
        userAgent: req.get('user-agent'),
        expiresAt: refreshExpiresAt,
      });

      // Update last login timestamp
      await updateLastLogin(user.id);

      // Log successful login
      await AuditService.logLogin(user.id, req);

      log.info('User logged in', {
        requestId: req.requestId,
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Return tokens
      return res.json({
        accessToken,
        refreshToken,
        expiresIn,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    })
  );

  /**
   * POST /auth/refresh
   * Exchange refresh token for new access token
   */
  router.post(
    '/auth/refresh',
    asyncHandler(async (req: Request, res: Response) => {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new BadRequestError('Refresh token required');
      }

      // Verify refresh token
      const payload = JWTService.verifyRefreshToken(refreshToken);

      // Verify token exists in database and hasn't been revoked
      const session = await SessionRepository.verifyRefreshToken(payload.userId, refreshToken);
      if (!session) {
        throw new UnauthorizedError('Invalid or revoked refresh token');
      }

      // Generate new token pair (rotate refresh token for security)
      const newTokens = JWTService.generateTokenPair({
        id: payload.userId,
        email: payload.email,
        role: payload.role,
      });

      // Delete old session and create new one
      await SessionRepository.deleteSession(session.id);

      const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await SessionRepository.createSession({
        adminUserId: payload.userId,
        refreshToken: newTokens.refreshToken,
        ipAddress: extractIP(req),
        userAgent: req.get('user-agent'),
        expiresAt: refreshExpiresAt,
      });

      // Log token refresh
      await AuditService.logTokenRefresh(payload.userId, req);

      log.info('Token refreshed', {
        requestId: req.requestId,
        userId: payload.userId,
      });

      return res.json({
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
        expiresIn: newTokens.expiresIn,
      });
    })
  );

  /**
   * POST /auth/logout
   * Revoke refresh token and invalidate session
   */
  router.post(
    '/auth/logout',
    authenticateRequest,
    asyncHandler(async (req: Request, res: Response) => {
      const { refreshToken } = req.body;

      if (refreshToken && req.user) {
        // Verify and delete the specific session
        const session = await SessionRepository.verifyRefreshToken(req.user.userId, refreshToken);
        if (session) {
          await SessionRepository.deleteSession(session.id);
        }
      }

      // Log logout
      if (req.user) {
        await AuditService.logLogout(req.user.userId, req);

        log.info('User logged out', {
          requestId: req.requestId,
          userId: req.user.userId,
        });
      }

      return res.status(204).send();
    })
  );

  /**
   * POST /auth/logout-all
   * Revoke all refresh tokens for user (logout from all devices)
   */
  router.post(
    '/auth/logout-all',
    authenticateRequest,
    asyncHandler(async (req: Request, res: Response) => {
      if (!req.user) {
        throw new UnauthorizedError('User not authenticated');
      }

      await SessionRepository.deleteAllUserSessions(req.user.userId);

      await AuditService.logLogout(req.user.userId, req);

      log.info('User logged out from all devices', {
        requestId: req.requestId,
        userId: req.user.userId,
      });

      return res.status(204).send();
    })
  );
};

/**
 * Extract IP address from request (handles proxies)
 */
function extractIP(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    (req.headers['x-real-ip'] as string) ||
    req.ip ||
    req.socket.remoteAddress ||
    'unknown'
  );
}
