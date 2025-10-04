import { eq } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { adminUsersTable } from '../db/schema.js';
import type { AdminUser } from '../types.js';

export const findAdminByEmail = async (email: string): Promise<AdminUser | undefined> => {
  const db = getDb();
  const normalisedEmail = email.toLowerCase();
  const [record] = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.email, normalisedEmail))
    .limit(1);

  if (!record) {
    return undefined;
  }

  return {
    id: record.id,
    email: record.email,
    passwordHash: record.passwordHash,
    role: record.role as AdminUser['role'],
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    lastLoginAt: record.lastLoginAt ? record.lastLoginAt.toISOString() : null
  } satisfies AdminUser;
};

export const updateAdminLastLogin = async (id: string): Promise<void> => {
  const db = getDb();
  const timestamp = new Date();
  await db
    .update(adminUsersTable)
    .set({ lastLoginAt: timestamp, updatedAt: timestamp })
    .where(eq(adminUsersTable.id, id));
};
