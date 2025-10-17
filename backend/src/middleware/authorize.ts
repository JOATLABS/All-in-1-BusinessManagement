import type { NextFunction, Request, Response } from 'express';
import type { AdminUser } from '../types.js';
import type { AuthenticatedUser } from './authenticate.js';

/**
 * Role-based authorization middleware factory
 * Requires authenticateRequest middleware to run first
 *
 * @param allowedRoles - Array of roles that can access the route
 * @returns Express middleware function
 */
export const requireRole = (allowedRoles: AdminUser['role'][]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as AuthenticatedUser | undefined;

    if (!user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        message: 'Insufficient permissions',
        required: allowedRoles,
        current: user.role,
      });
    }

    return next();
  };
};

/**
 * Checks if user can access their own resource or is superadmin
 *
 * @param resourceOwnerId - ID of the resource owner (e.g., admin user ID)
 * @returns boolean indicating access permission
 */
export const canAccessOwnOrSuperadmin = (req: Request, resourceOwnerId: string): boolean => {
  const user = req.user as AuthenticatedUser | undefined;

  if (!user) {
    return false;
  }

  return user.userId === resourceOwnerId || user.role === 'superadmin';
};
