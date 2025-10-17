import type { Router } from 'express';
import type { AdminUser } from '../types.js';
import { authenticateRequest } from '../middleware/authenticate.js';
import { requireRole, canAccessOwnOrSuperadmin } from '../middleware/authorize.js';
import { log } from '../config/logger.js';
import {
  listAdminUsers,
  findAdminById,
  createAdminUser,
  updateAdminUser,
  deactivateAdminUser
} from '../repositories/adminUserRepository.js';
import {
  createAdminUserSchema,
  updateAdminUserSchema,
  listAdminUsersQuerySchema,
} from '../validation/adminUsers.js';

const omitPasswordHash = <T extends { passwordHash?: string }>(user: T) => {
  const { passwordHash: _passwordHash, ...rest } = user;
  void _passwordHash;
  return rest;
};

export const registerAdminUserRoutes = (router: Router) => {
  // List all admin users (superadmin only)
  router.get(
    '/admin/users',
    authenticateRequest,
    requireRole(['superadmin']),
    async (req, res) => {
      try {
        const queryResult = listAdminUsersQuerySchema.safeParse(req.query);
        if (!queryResult.success) {
          return res.status(400).json({ message: 'Invalid query parameters' });
        }

        const filters: { role?: AdminUser['role']; isActive?: boolean } = {
          role: queryResult.data.role,
          isActive:
            queryResult.data.isActive === 'true'
              ? true
              : queryResult.data.isActive === 'false'
              ? false
              : undefined,
        };

        const users = await listAdminUsers(filters);

        // Exclude password hashes from response
        const sanitizedUsers = users.map((user) => omitPasswordHash(user));

        return res.json({ users: sanitizedUsers });
      } catch (error) {
        log.error('Error listing admin users', error, {
          requestId: req.requestId,
          userId: req.user?.userId,
        });
        return res.status(500).json({ message: 'Failed to list admin users' });
      }
    }
  );

  // Get single admin user (self or superadmin)
  router.get(
    '/admin/users/:id',
    authenticateRequest,
    async (req, res) => {
      try {
        const { id } = req.params;

        if (!canAccessOwnOrSuperadmin(req, id)) {
          return res.status(403).json({ message: 'Insufficient permissions' });
        }

        const user = await findAdminById(id);
        if (!user) {
          return res.status(404).json({ message: 'Admin user not found' });
        }

        // Exclude password hash
        return res.json({ user: omitPasswordHash(user) });
      } catch (error) {
        log.error('Error fetching admin user', error, {
          requestId: req.requestId,
          userId: req.user?.userId,
        });
        return res.status(500).json({ message: 'Failed to fetch admin user' });
      }
    }
  );

  // Create new admin user (superadmin only)
  router.post(
    '/admin/users',
    authenticateRequest,
    requireRole(['superadmin']),
    async (req, res) => {
      try {
        const parseResult = createAdminUserSchema.safeParse(req.body);
        if (!parseResult.success) {
          return res.status(400).json({
            message: 'Invalid request body',
            errors: parseResult.error.errors
          });
        }

        const data = parseResult.data;
        const createdBy = req.user?.userId;

        const user = await createAdminUser({
          ...data,
          createdBy,
        });

        return res.status(201).json({ user: omitPasswordHash(user) });
      } catch (error) {
        if (error instanceof Error && error.message.includes('unique')) {
          return res.status(409).json({ message: 'Admin user with this email already exists' });
        }

        log.error('Error creating admin user', error, {
          requestId: req.requestId,
          userId: req.user?.userId,
        });
        return res.status(500).json({ message: 'Failed to create admin user' });
      }
    }
  );

  // Update admin user (self or superadmin)
  router.patch(
    '/admin/users/:id',
    authenticateRequest,
    async (req, res) => {
      try {
        const { id } = req.params;

        // Allow self-updates for profile, but only superadmin can change role/isActive
        const isSelf = req.user?.userId === id;
        const isSuperadmin = req.user?.role === 'superadmin';

        if (!isSelf && !isSuperadmin) {
          return res.status(403).json({ message: 'Insufficient permissions' });
        }

        const parseResult = updateAdminUserSchema.safeParse(req.body);
        if (!parseResult.success) {
          return res.status(400).json({
            message: 'Invalid request body',
            errors: parseResult.error.errors
          });
        }

        const data = parseResult.data;

        // Non-superadmin can only update their own first/last name
        if (isSelf && !isSuperadmin) {
          if (data.role || typeof data.isActive === 'boolean') {
            return res.status(403).json({ message: 'Cannot change role or active status' });
          }
        }

        // Prevent superadmin from demoting themselves
        if (isSelf && isSuperadmin && data.role && data.role !== 'superadmin') {
          return res.status(400).json({ message: 'Cannot demote yourself from superadmin' });
        }

        const user = await updateAdminUser(id, data);
        if (!user) {
          return res.status(404).json({ message: 'Admin user not found' });
        }

        // Exclude password hash
        return res.json({ user: omitPasswordHash(user) });
      } catch (error) {
        log.error('Error updating admin user', error, {
          requestId: req.requestId,
          userId: req.user?.userId,
        });
        return res.status(500).json({ message: 'Failed to update admin user' });
      }
    }
  );

  // Deactivate admin user (superadmin only, cannot deactivate self)
  router.delete(
    '/admin/users/:id',
    authenticateRequest,
    requireRole(['superadmin']),
    async (req, res) => {
      try {
        const { id } = req.params;

        // Prevent self-deletion
        if (req.user?.userId === id) {
          return res.status(400).json({ message: 'Cannot deactivate your own account' });
        }

        const user = await deactivateAdminUser(id);
        if (!user) {
          return res.status(404).json({ message: 'Admin user not found' });
        }

        // Exclude password hash
        return res.json({ user: omitPasswordHash(user) });
      } catch (error) {
        log.error('Error deactivating admin user', error, {
          requestId: req.requestId,
          userId: req.user?.userId,
        });
        return res.status(500).json({ message: 'Failed to deactivate admin user' });
      }
    }
  );
};
