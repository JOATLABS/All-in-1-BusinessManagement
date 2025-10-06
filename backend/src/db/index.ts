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
  `ALTER TABLE site_content ADD COLUMN IF NOT EXISTS reservation JSONB NOT NULL DEFAULT '{}'::jsonb`
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
