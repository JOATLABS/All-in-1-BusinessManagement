import bcrypt from 'bcryptjs';
import { findAdminByEmail, updateAdminLastLogin } from '../repositories/adminUserRepository.js';
import type { AdminUser } from '../types.js';

export const authenticate = async (
  email: string,
  password: string
): Promise<(Pick<AdminUser, 'id' | 'email' | 'role' | 'firstName' | 'lastName'>) | null> => {
  const user = await findAdminByEmail(email);
  if (!user) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName || undefined,
    lastName: user.lastName || undefined,
  };
};

// Export updateLastLogin for use in auth routes
export const updateLastLogin = updateAdminLastLogin;
