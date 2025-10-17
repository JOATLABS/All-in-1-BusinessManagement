/**
 * Database Migration Script
 * Manually creates the new tables for Section 10 (Security Hardening)
 *
 * Run with: npm run db:migrate
 */

import 'dotenv/config';
import { getDb, initializeDatabase } from './index.js';
import { sql } from 'drizzle-orm';

async function migrate() {
  try {
    console.log('Starting database migration for Section 10...');

    // Initialize database connection
    await initializeDatabase();
    const db = getDb();

    // Create admin_user_sessions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS admin_user_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        admin_user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
        refresh_token_hash TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        last_used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      );
    `);
    console.log('✓ Created admin_user_sessions table');

    // Create indexes for admin_user_sessions
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id
      ON admin_user_sessions(admin_user_id);
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_sessions_expires
      ON admin_user_sessions(expires_at);
    `);
    console.log('✓ Created indexes for admin_user_sessions');

    // Create audit_logs table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        admin_user_id UUID REFERENCES admin_users(id),
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id UUID,
        changes JSONB,
        ip_address TEXT,
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      );
    `);
    console.log('✓ Created audit_logs table');

    // Create indexes for audit_logs
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_audit_user_id
      ON audit_logs(admin_user_id);
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_audit_entity
      ON audit_logs(entity_type, entity_id);
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_audit_created
      ON audit_logs(created_at);
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_audit_action
      ON audit_logs(action);
    `);
    console.log('✓ Created indexes for audit_logs');

    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
