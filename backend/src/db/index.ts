import { Pool, type PoolClient } from 'pg';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { config } from '../config.js';
import * as schema from './schema.js';
import { ensureSeedData } from './seed.js';

let pool: Pool | null = null;
let db: NodePgDatabase<typeof schema> | null = null;

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
  )`,
  `CREATE TABLE IF NOT EXISTS site_content (
    id TEXT PRIMARY KEY,
    hero JSONB NOT NULL,
    event JSONB NOT NULL,
    footer JSONB NOT NULL,
    reservation JSONB NOT NULL,
    overlays JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `ALTER TABLE site_content ADD COLUMN IF NOT EXISTS reservation JSONB NOT NULL DEFAULT '{}'::jsonb`,
  `CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY,
    tier_id TEXT NOT NULL,
    guest_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    guest_count INTEGER NOT NULL,
    payment_intent_id TEXT,
    status TEXT NOT NULL,
    confirmation_code TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS reservations_tier_status_idx ON reservations (tier_id, status)`,
  // Single-tenant events table - no club_id
  `CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    is_free_entry BOOLEAN NOT NULL DEFAULT true,
    requires_rsvp BOOLEAN NOT NULL DEFAULT false,
    capacity INTEGER,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    flyer_url TEXT,
    ticket_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS events_starts_at_idx ON events (starts_at DESC)`,
  `CREATE INDEX IF NOT EXISTS events_featured_idx ON events (is_featured, starts_at DESC)`,
  // Customers table for forecasting
  `CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    phone TEXT,
    first_visit_date TIMESTAMPTZ,
    total_visits INTEGER NOT NULL DEFAULT 0,
    total_no_shows INTEGER NOT NULL DEFAULT 0,
    last_visit_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS customers_email_idx ON customers (email)`,
  // Tickets table for both free RSVPs and paid tickets
  `CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id),
    guest_name TEXT NOT NULL,
    guest_email TEXT NOT NULL,
    guest_phone TEXT,
    ticket_type TEXT NOT NULL,
    qr_code TEXT NOT NULL UNIQUE,
    qr_code_image_url TEXT,
    status TEXT NOT NULL DEFAULT 'issued',
    redeemed_at TIMESTAMPTZ,
    redeemed_by TEXT,
    payment_intent_id TEXT,
    amount_paid NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS tickets_event_status_idx ON tickets (event_id, status)`,
  `CREATE INDEX IF NOT EXISTS tickets_qr_code_idx ON tickets (qr_code)`,
  `CREATE INDEX IF NOT EXISTS tickets_customer_idx ON tickets (customer_id)`,
  // Attendance events for forecasting models
  `CREATE TABLE IF NOT EXISTS attendance_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    ticket_id UUID REFERENCES tickets(id),
    rsvp_timestamp TIMESTAMPTZ NOT NULL,
    attended BOOLEAN DEFAULT false,
    scan_timestamp TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS attendance_events_customer_idx ON attendance_events (customer_id)`,
  `CREATE INDEX IF NOT EXISTS attendance_events_event_idx ON attendance_events (event_id)`
];

const ensureSchema = async (client: PoolClient): Promise<void> => {
  await client.query('BEGIN');
  try {
    for (const statement of schemaStatements) {
      await client.query(statement);
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
};

export const initializeDatabase = async () => {
  if (db) {
    return db;
  }

  pool = new Pool({ connectionString: config.databaseUrl });

  const client = await pool.connect();
  try {
    await ensureSchema(client);
  } finally {
    client.release();
  }

  db = drizzle(pool, { schema });
  await ensureSeedData(db);

  return db;
};

export const getDb = () => {
  if (!db) {
    throw new Error('Database has not been initialised');
  }

  return db;
};

export const getPool = () => {
  if (!pool) {
    throw new Error('Database pool has not been initialised');
  }

  return pool;
};
