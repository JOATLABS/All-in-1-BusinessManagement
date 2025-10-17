import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { env } from '../config/env';

/**
 * JWT Token Payload Structure
 */
export interface JWTPayload {
  userId: string;
  email: string;
  role: 'superadmin' | 'admin' | 'staff';
  tokenId: string; // Unique identifier for this token (for revocation)
  type: 'access' | 'refresh';
}

/**
 * Token Pair returned after login
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // Access token expiry in seconds
}

/**
 * JWT Service
 * Handles generation, verification, and decoding of JWT tokens
 */
export class JWTService {
  /**
   * Generate access and refresh token pair
   */
  static generateTokenPair(user: { id: string; email: string; role: 'superadmin' | 'admin' | 'staff' }): TokenPair {
    const tokenId = randomUUID();

    // Access Token (short-lived: 15 minutes)
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        tokenId,
        type: 'access',
      } as JWTPayload,
      env.JWT_SECRET,
      {
        expiresIn: env.JWT_ACCESS_EXPIRY,
        issuer: 'ojaplus-venture-system',
        audience: 'ojaplus-admin',
      }
    );

    // Refresh Token (long-lived: 7 days)
    const refreshToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        tokenId,
        type: 'refresh',
      } as JWTPayload,
      env.JWT_REFRESH_SECRET,
      {
        expiresIn: env.JWT_REFRESH_EXPIRY,
        issuer: 'ojaplus-venture-system',
        audience: 'ojaplus-admin',
      }
    );

    // Calculate expiry in seconds (15m = 900s)
    const expiresIn = this.parseExpiry(env.JWT_ACCESS_EXPIRY);

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  /**
   * Verify and decode access token
   */
  static verifyAccessToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET, {
        issuer: 'ojaplus-venture-system',
        audience: 'ojaplus-admin',
      }) as JWTPayload;

      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Access token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid access token');
      }
      throw error;
    }
  }

  /**
   * Verify and decode refresh token
   */
  static verifyRefreshToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET, {
        issuer: 'ojaplus-venture-system',
        audience: 'ojaplus-admin',
      }) as JWTPayload;

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token');
      }
      throw error;
    }
  }

  /**
   * Decode token without verification (for logging/debugging)
   */
  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch {
      return null;
    }
  }

  /**
   * Generate password reset token (1 hour expiry)
   */
  static generatePasswordResetToken(userId: string, email: string): string {
    return jwt.sign(
      {
        userId,
        email,
        purpose: 'password_reset',
      },
      env.JWT_SECRET,
      {
        expiresIn: '1h',
        issuer: 'ojaplus-venture-system',
        audience: 'ojaplus-password-reset',
      }
    );
  }

  /**
   * Verify password reset token
   */
  static verifyPasswordResetToken(token: string): { userId: string; email: string } {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET, {
        issuer: 'ojaplus-venture-system',
        audience: 'ojaplus-password-reset',
      }) as any;

      if (decoded.purpose !== 'password_reset') {
        throw new Error('Invalid token purpose');
      }

      return {
        userId: decoded.userId,
        email: decoded.email,
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Password reset token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid password reset token');
      }
      throw error;
    }
  }

  /**
   * Parse expiry string to seconds (e.g., "15m" -> 900, "7d" -> 604800)
   */
  private static parseExpiry(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error(`Invalid expiry format: ${expiry}`);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 60 * 60 * 24;
      default:
        throw new Error(`Unknown time unit: ${unit}`);
    }
  }

  /**
   * Check if token is expiring soon (within 5 minutes)
   */
  static isTokenExpiringSoon(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) {
        return false;
      }

      const expiryTime = decoded.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;

      return expiryTime - now < fiveMinutes;
    } catch {
      return false;
    }
  }
}
