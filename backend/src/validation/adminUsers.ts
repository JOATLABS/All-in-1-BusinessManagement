import { z } from 'zod';

const roleSchema = z.enum(['superadmin', 'admin', 'staff']);

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const createAdminUserSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: passwordSchema,
  role: roleSchema,
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional()
});

export const updateAdminUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  role: roleSchema.optional(),
  isActive: z.boolean().optional()
});

export const listAdminUsersQuerySchema = z.object({
  role: roleSchema.optional(),
  isActive: z.enum(['true', 'false']).optional()
});

export type CreateAdminUserPayload = z.infer<typeof createAdminUserSchema>;
export type UpdateAdminUserPayload = z.infer<typeof updateAdminUserSchema>;
export type ListAdminUsersQuery = z.infer<typeof listAdminUsersQuerySchema>;
