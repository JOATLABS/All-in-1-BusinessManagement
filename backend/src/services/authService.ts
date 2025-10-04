import bcrypt from 'bcryptjs';
import { findAdminByEmail, updateAdminLastLogin } from '../repositories/adminUserRepository.js';
import type { AdminUser } from '../types.js';

export const authenticate = async (
  email: string,
  password: string
): Promise<Pick<AdminUser, 'id' | 'email' | 'role'> | null> => {
  const user = await findAdminByEmail(email);
  if (!user) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  await updateAdminLastLogin(user.id);

  return { id: user.id, email: user.email, role: user.role };
};
