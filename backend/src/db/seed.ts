import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { config } from '../config.js';
import type { AdminUser, SiteContent } from '../types.js';
import * as schema from './schema.js';
import { adminUsersTable, siteContentTable, eventsTable } from './schema.js';

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
    const [record] = existing;
    const reservation = record.reservation as Partial<SiteContent['reservation']> | null;
    const hasTableTiers = Boolean(
      reservation &&
      Array.isArray(reservation.tableTiers) &&
      reservation.tableTiers.length > 0 &&
      reservation.tableTiers.every((tier) =>
        tier &&
        typeof tier === 'object' &&
        'price' in tier &&
        'visual' in tier &&
        'total' in tier &&
        'reserved' in tier
      )
    );

    if (!hasTableTiers) {
      const seed = await readSeedFile<SiteContent>('siteContent.json');
      if (!seed) {
        throw new Error('Site content seed data is required to bootstrap the database.');
      }

      await db
        .update(siteContentTable)
        .set({ reservation: seed.reservation, updatedAt: new Date() })
        .where(eq(siteContentTable.id, DEFAULT_SITE_CONTENT_ID));
    }

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
    reservation: seed.reservation,
    overlays: seed.overlays,
    updatedAt: new Date()
  });
};

const ensureAdminUsers = async (db: Database): Promise<void> => {
  const admins = await db.select().from(adminUsersTable).limit(1);
  if (admins.length > 0) {
    return;
  }

  const rootAdminEmail = process.env.ROOT_ADMIN_EMAIL?.trim();
  const rootAdminPassword = process.env.ROOT_ADMIN_PASSWORD?.trim();

  if (rootAdminEmail && !rootAdminPassword) {
    throw new Error('ROOT_ADMIN_PASSWORD is required when ROOT_ADMIN_EMAIL is provided.');
  }

  if (!rootAdminEmail && rootAdminPassword) {
    throw new Error('ROOT_ADMIN_EMAIL is required when ROOT_ADMIN_PASSWORD is provided.');
  }

  if (rootAdminEmail && rootAdminPassword) {
    const now = new Date();
    const passwordHash = await bcrypt.hash(rootAdminPassword, 12);

    await db.insert(adminUsersTable).values({
      id: randomUUID(),
      email: rootAdminEmail.toLowerCase(),
      passwordHash,
      role: 'superadmin',
      createdAt: now,
      updatedAt: now,
      lastLoginAt: null
    });

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

const ensureEvents = async (db: Database): Promise<void> => {
  const existing = await db.select().from(eventsTable).limit(1);

  if (existing.length > 0) {
    return; // Events already seeded
  }

  const seedEvents = await readSeedFile<Array<{
    title: string;
    slug: string;
    description: string;
    startsAt: string;
    endsAt: string;
    isFreeEntry: boolean;
    requiresRsvp: boolean;
    capacity: number;
    isFeatured: boolean;
    flyerUrl: string | null;
    ticketUrl: string | null;
  }>>('events.json');

  if (!seedEvents || seedEvents.length === 0) {
    console.warn('No events seed data found. Skipping event seeding.');
    return;
  }

  await db.insert(eventsTable).values(
    seedEvents.map((event) => ({
      id: randomUUID(),
      title: event.title,
      slug: event.slug,
      description: event.description,
      startsAt: new Date(event.startsAt),
      endsAt: new Date(event.endsAt),
      isFreeEntry: event.isFreeEntry,
      requiresRsvp: event.requiresRsvp,
      capacity: event.capacity,
      isFeatured: event.isFeatured,
      flyerUrl: event.flyerUrl,
      ticketUrl: event.ticketUrl,
      createdAt: new Date(),
      updatedAt: new Date()
    }))
  );

  console.log(`Seeded ${seedEvents.length} events`);
};

export const ensureSeedData = async (db: Database): Promise<void> => {
  await ensureSiteContent(db);
  await ensureAdminUsers(db);
  await ensureEvents(db);
};
