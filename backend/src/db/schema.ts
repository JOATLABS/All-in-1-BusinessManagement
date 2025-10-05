import { pgTable, jsonb, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import type {
  AdminUser,
  EventContent,
  FooterContent,
  HeroContent,
  OverlaysContent,
  ReservationContent
} from '../types.js';

export const siteContentTable = pgTable('site_content', {
  id: text('id').primaryKey(),
  hero: jsonb('hero').$type<HeroContent>().notNull(),
  event: jsonb('event').$type<EventContent>().notNull(),
  footer: jsonb('footer').$type<FooterContent>().notNull(),
  reservation: jsonb('reservation').$type<ReservationContent>().notNull(),
  overlays: jsonb('overlays').$type<OverlaysContent>().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const adminUsersTable = pgTable('admin_users', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true })
});

export type SiteContentRow = typeof siteContentTable.$inferSelect;
export type AdminUserRow = typeof adminUsersTable.$inferSelect;
