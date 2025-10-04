import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { config } from '../config.js';
import type { AdminUser, SiteContent } from '../types.js';
import * as schema from './schema.js';
import { adminUsersTable, siteContentTable } from './schema.js';

export const DEFAULT_SITE_CONTENT_ID = 'primary-site';

type Database = NodePgDatabase<typeof schema>;

const resolveSeedPath = (filename: string) => path.resolve(config.seedDataDir, filename);

const readSeedFile = async <T>(filename: string): Promise<T | null> => {
  try {
    const filePath = resolveSeedPath(filename);
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`Seed file ${filename} could not be read:`, error);
    return null;
  }
};

const ensureSiteContent = async (db: Database): Promise<void> => {
  const existing = await db
    .select()
    .from(siteContentTable)
    .where(eq(siteContentTable.id, DEFAULT_SITE_CONTENT_ID));

  if (existing.length > 0) {
    return;
  }

  const seed = await readSeedFile<SiteContent>('siteContent.json');
  if (!seed) {
    throw new Error('Site content seed data is required to bootstrap the database.');
  }

  await db.insert(siteContentTable).values({
    id: DEFAULT_SITE_CONTENT_ID,
    hero: seed.hero,
    event: seed.event,
    footer: seed.footer,
    overlays: seed.overlays,
    updatedAt: new Date()
  });
};

const ensureAdminUsers = async (db: Database): Promise<void> => {
  const admins = await db.select().from(adminUsersTable).limit(1);
  if (admins.length > 0) {
    return;
  }

  const seedUsers = await readSeedFile<AdminUser[]>('adminUsers.json');
  if (!seedUsers || seedUsers.length === 0) {
    throw new Error('Admin seed data is required to bootstrap the database.');
  }

  await db.insert(adminUsersTable).values(
    seedUsers.map((user) => ({
      id: user.id,
      email: user.email.toLowerCase(),
      passwordHash: user.passwordHash,
      role: user.role,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
      lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : null
    }))
  );
};

export const ensureSeedData = async (db: Database): Promise<void> => {
  await ensureSiteContent(db);
  await ensureAdminUsers(db);
};
