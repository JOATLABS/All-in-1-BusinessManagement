import { pgTable, jsonb, text, timestamp, uuid, integer, boolean, numeric } from 'drizzle-orm/pg-core';
import type {
  EventContent,
  FooterContent,
  HeroContent,
  OverlaysContent,
  ReservationContent
} from '../types.js';

/**
 * Single-tenant schema design:
 * No tenant_id columns needed—all tables contain data for the one lounge.
 * Queries are simplified without tenant filtering logic.
 */

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
  firstName: text('first_name'),
  lastName: text('last_name'),
  isActive: boolean('is_active').notNull().default(true),
  createdBy: uuid('created_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true })
});

export type SiteContentRow = typeof siteContentTable.$inferSelect;
export type AdminUserRow = typeof adminUsersTable.$inferSelect;

export const reservationsTable = pgTable('reservations', {
  id: uuid('id').primaryKey(),
  tierId: text('tier_id').notNull(),
  guestName: text('guest_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  guestCount: integer('guest_count').notNull(),
  paymentIntentId: text('payment_intent_id'),
  status: text('status').notNull(),
  confirmationCode: text('confirmation_code').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export type ReservationRow = typeof reservationsTable.$inferSelect;

/**
 * Events table - Single-tenant design for free and paid events
 * No club_id needed - all events belong to the one venue
 */
export const eventsTable = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
  isFreeEntry: boolean('is_free_entry').notNull().default(true),
  requiresRsvp: boolean('requires_rsvp').notNull().default(false),
  capacity: integer('capacity'),
  isFeatured: boolean('is_featured').notNull().default(false),
  flyerUrl: text('flyer_url'),
  ticketUrl: text('ticket_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export type EventRow = typeof eventsTable.$inferSelect;

/**
 * Tickets table - For both free RSVPs and paid tickets
 * Single-tenant: no club_id, all tickets for the one venue
 */
export const ticketsTable = pgTable('tickets', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => eventsTable.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').references(() => customersTable.id),
  guestName: text('guest_name').notNull(),
  guestEmail: text('guest_email').notNull(),
  guestPhone: text('guest_phone'),
  ticketType: text('ticket_type').notNull(), // 'free_rsvp', 'paid_general', 'paid_vip'
  qrCode: text('qr_code').notNull().unique(),
  qrCodeImageUrl: text('qr_code_image_url'),
  status: text('status').notNull().default('issued'), // 'issued', 'redeemed', 'cancelled'
  redeemedAt: timestamp('redeemed_at', { withTimezone: true }),
  redeemedBy: text('redeemed_by'), // Staff member who scanned
  paymentIntentId: text('payment_intent_id'), // null for free tickets
  amountPaid: numeric('amount_paid', { precision: 10, scale: 2 }).default('0'), // 0 for free
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export type TicketRow = typeof ticketsTable.$inferSelect;

/**
 * Customers table - For building forecasting models
 * Track customer behavior across all events (single venue)
 */
export const customersTable = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name'),
  phone: text('phone'),
  firstVisitDate: timestamp('first_visit_date', { withTimezone: true }),
  totalVisits: integer('total_visits').notNull().default(0),
  totalNoShows: integer('total_no_shows').notNull().default(0),
  lastVisitDate: timestamp('last_visit_date', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export type CustomerRow = typeof customersTable.$inferSelect;

/**
 * Attendance events - Track RSVPs vs actual attendance for forecasting
 * Single-tenant: all attendance data for the one venue
 */
export const attendanceEventsTable = pgTable('attendance_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').notNull().references(() => customersTable.id),
  eventId: uuid('event_id').notNull().references(() => eventsTable.id, { onDelete: 'cascade' }),
  ticketId: uuid('ticket_id').references(() => ticketsTable.id),
  rsvpTimestamp: timestamp('rsvp_timestamp', { withTimezone: true }).notNull(),
  attended: boolean('attended').default(false),
  scanTimestamp: timestamp('scan_timestamp', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export type AttendanceEventRow = typeof attendanceEventsTable.$inferSelect;

/**
 * Admin User Sessions - JWT refresh token tracking
 * Single-tenant: all sessions for the one venue's admin users
 */
export const adminUserSessionsTable = pgTable('admin_user_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  adminUserId: uuid('admin_user_id')
    .notNull()
    .references(() => adminUsersTable.id, { onDelete: 'cascade' }),
  refreshTokenHash: text('refresh_token_hash').notNull(), // Hashed refresh token for security
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }).notNull().defaultNow()
});

export type AdminUserSessionRow = typeof adminUserSessionsTable.$inferSelect;

/**
 * Audit Logs - Track all admin actions for compliance and security
 * Single-tenant: all audit logs for the one venue
 */
export const auditLogsTable = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  adminUserId: uuid('admin_user_id').references(() => adminUsersTable.id),
  action: text('action').notNull(), // 'create', 'update', 'delete', 'login', 'logout', 'failed_login', 'password_reset'
  entityType: text('entity_type').notNull(), // 'admin_user', 'event', 'site_content', 'reservation', 'session'
  entityId: uuid('entity_id'), // ID of the affected entity (nullable for actions like login)
  changes: jsonb('changes'), // Before/after snapshots for update actions
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export type AuditLogRow = typeof auditLogsTable.$inferSelect;
