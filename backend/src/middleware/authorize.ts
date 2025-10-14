import type { NextFunction, Request, Response } from 'express';
import type { AdminUser } from '../types.js';

/**
 * Role-based authorization middleware factory
 * Requires authenticateRequest middleware to run first
 *
 * @param allowedRoles - Array of roles that can access the route
 * @returns Express middleware function
 */
export const requireRole = (allowedRoles: AdminUser['role'][]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.adminSession) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userRole = req.adminSession.role;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: 'Insufficient permissions',
        required: allowedRoles,
        current: userRole
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
  if (!req.adminSession) {
    return false;
  }

  return req.adminSession.adminId === resourceOwnerId || req.adminSession.role === 'superadmin';
};
