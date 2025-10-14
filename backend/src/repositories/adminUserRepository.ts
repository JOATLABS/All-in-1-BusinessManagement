import { randomUUID } from 'node:crypto';
import { eq, and, desc } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { getDb } from '../db/index.js';
import { adminUsersTable } from '../db/schema.js';
import type { AdminUser } from '../types.js';

const mapRowToAdminUser = (record: typeof adminUsersTable.$inferSelect): AdminUser => ({
  id: record.id,
  email: record.email,
  passwordHash: record.passwordHash,
  role: record.role as AdminUser['role'],
  firstName: record.firstName ?? null,
  lastName: record.lastName ?? null,
  isActive: record.isActive,
  createdBy: record.createdBy ?? null,
  createdAt: record.createdAt instanceof Date ? record.createdAt.toISOString() : record.createdAt,
  updatedAt: record.updatedAt instanceof Date ? record.updatedAt.toISOString() : record.updatedAt,
  lastLoginAt: record.lastLoginAt ? (record.lastLoginAt instanceof Date ? record.lastLoginAt.toISOString() : record.lastLoginAt) : null
});

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

  return mapRowToAdminUser(record);
};

export const findAdminById = async (id: string): Promise<AdminUser | undefined> => {
  const db = getDb();
  const [record] = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.id, id))
    .limit(1);

  if (!record) {
    return undefined;
  }

  return mapRowToAdminUser(record);
};

export interface ListAdminUsersFilters {
  role?: AdminUser['role'];
  isActive?: boolean;
}

export const listAdminUsers = async (filters?: ListAdminUsersFilters): Promise<AdminUser[]> => {
  const db = getDb();
  let query = db.select().from(adminUsersTable).$dynamic();

  if (filters?.role) {
    query = query.where(eq(adminUsersTable.role, filters.role));
  }

  if (typeof filters?.isActive === 'boolean') {
    const activeCondition = eq(adminUsersTable.isActive, filters.isActive);
    query = query.where(filters.role ? and(eq(adminUsersTable.role, filters.role), activeCondition) : activeCondition);
  }

  const records = await query.orderBy(desc(adminUsersTable.createdAt));
  return records.map(mapRowToAdminUser);
};

export interface CreateAdminUserPayload {
  email: string;
  password: string;
  role: AdminUser['role'];
  firstName?: string;
  lastName?: string;
  createdBy?: string;
}

export const createAdminUser = async (data: CreateAdminUserPayload): Promise<AdminUser> => {
  const db = getDb();
  const id = randomUUID();
  const passwordHash = await bcrypt.hash(data.password, 12);
  const now = new Date();

  const [record] = await db
    .insert(adminUsersTable)
    .values({
      id,
      email: data.email.toLowerCase(),
      passwordHash,
      role: data.role,
      firstName: data.firstName ?? null,
      lastName: data.lastName ?? null,
      isActive: true,
      createdBy: data.createdBy ?? null,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: null
    })
    .returning();

  return mapRowToAdminUser(record);
};

export interface UpdateAdminUserPayload {
  firstName?: string;
  lastName?: string;
  role?: AdminUser['role'];
  isActive?: boolean;
}

export const updateAdminUser = async (id: string, data: UpdateAdminUserPayload): Promise<AdminUser | undefined> => {
  const db = getDb();
  const timestamp = new Date();

  const [record] = await db
    .update(adminUsersTable)
    .set({
      ...data,
      updatedAt: timestamp
    })
    .where(eq(adminUsersTable.id, id))
    .returning();

  if (!record) {
    return undefined;
  }

  return mapRowToAdminUser(record);
};

export const deactivateAdminUser = async (id: string): Promise<AdminUser | undefined> => {
  return updateAdminUser(id, { isActive: false });
};

export const updateAdminLastLogin = async (id: string): Promise<void> => {
  const db = getDb();
  const timestamp = new Date();
  await db
    .update(adminUsersTable)
    .set({ lastLoginAt: timestamp, updatedAt: timestamp })
    .where(eq(adminUsersTable.id, id));
};
