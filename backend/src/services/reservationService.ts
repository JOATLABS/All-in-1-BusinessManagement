import { randomUUID, randomBytes } from 'node:crypto';
import { sql, eq, desc } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { getDb } from '../db/index.js';
import { DEFAULT_SITE_CONTENT_ID } from '../db/seed.js';
import * as schema from '../db/schema.js';
import { reservationsTable, siteContentTable } from '../db/schema.js';
import type { ReservationContent, ReservationRecord, ReservationStatus } from '../types.js';
import type {
  CreateReservationPayload,
  AdminReservationQuery,
  UpdateReservationStatusPayload
} from '../validation/reservations.js';

export class ReservationTierNotFoundError extends Error {
  constructor(message = 'Selected section was not found') {
    super(message);
    this.name = 'ReservationTierNotFoundError';
  }
}

export class ReservationSoldOutError extends Error {
  constructor(message = 'This section just sold out. Choose another size to continue.') {
    super(message);
    this.name = 'ReservationSoldOutError';
  }
}

export class ReservationNotFoundError extends Error {
  constructor(message = 'Reservation could not be found') {
    super(message);
    this.name = 'ReservationNotFoundError';
  }
}

export interface ReservationAvailabilityTierSummary {
  tierId: string;
  total: number;
  baseReserved: number;
  confirmed: number;
  available: number;
}

export interface ReservationAvailabilitySummary {
  total: number;
  baseReserved: number;
  confirmed: number;
  available: number;
}

export interface ReservationAvailability {
  tiers: ReservationAvailabilityTierSummary[];
  summary: ReservationAvailabilitySummary;
}

export interface CreatedReservation {
  id: string;
  confirmationCode: string;
  status: 'confirmed';
}

export interface CreateReservationResult {
  reservation: CreatedReservation;
  availability: ReservationAvailability;
}

type Database = NodePgDatabase<typeof schema>;

type ConfirmedCountRow = { tierId: string; confirmed: number };

export interface ReservationWithTierSummary extends ReservationRecord {
  tierLabel: string;
  tierPrice: string;
  tierCapacity: string;
}

const generateConfirmationCode = (tierId: string) => {
  const identifier = tierId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase() || 'VIP';
  const random = randomBytes(4).toString('hex').toUpperCase();
  return `${identifier}-${random}`;
};

const buildAvailability = (
  reservationContent: ReservationContent,
  confirmedRows: ConfirmedCountRow[]
): ReservationAvailability => {
  const confirmedMap = new Map<string, number>();
  for (const row of confirmedRows) {
    confirmedMap.set(row.tierId, Number(row.confirmed));
  }

  const tiers = reservationContent.tableTiers.map((tier) => {
    const baseReserved = Math.min(tier.reserved, tier.total);
    const confirmed = confirmedMap.get(tier.id) ?? 0;
    const available = Math.max(tier.total - baseReserved - confirmed, 0);

    return {
      tierId: tier.id,
      total: tier.total,
      baseReserved,
      confirmed,
      available
    } satisfies ReservationAvailabilityTierSummary;
  });

  const summary = tiers.reduce(
    (accumulator, tier) => {
      accumulator.total += tier.total;
      accumulator.baseReserved += tier.baseReserved;
      accumulator.confirmed += tier.confirmed;
      accumulator.available += tier.available;
      return accumulator;
    },
    { total: 0, baseReserved: 0, confirmed: 0, available: 0 } satisfies ReservationAvailabilitySummary
  );

  return { tiers, summary };
};

const fetchReservationContent = async (db: Database): Promise<ReservationContent> => {
  const result = await db.execute(
    sql`SELECT reservation FROM site_content WHERE id = ${DEFAULT_SITE_CONTENT_ID} FOR UPDATE`
  );

  if (!result.rows.length) {
    throw new Error('Site content has not been initialised.');
  }

  const [row] = result.rows as Array<{ reservation: ReservationContent }>;
  return row.reservation;
};

const fetchReservationContentSnapshot = async (db: Database): Promise<ReservationContent> => {
  const result = await db
    .select({ reservation: siteContentTable.reservation })
    .from(siteContentTable)
    .where(eq(siteContentTable.id, DEFAULT_SITE_CONTENT_ID))
    .limit(1);

  if (!result.length) {
    throw new Error('Site content has not been initialised.');
  }

  const [record] = result;
  return record.reservation;
};

const buildTierLookup = (reservationContent: ReservationContent) => {
  const lookup = new Map<string, ReservationContent['tableTiers'][number]>();
  for (const tier of reservationContent.tableTiers) {
    lookup.set(tier.id, tier);
  }
  return lookup;
};

const mapReservationWithTier = (
  row: ReservationRecord,
  lookup: Map<string, ReservationContent['tableTiers'][number]>
): ReservationWithTierSummary => {
  const tier = lookup.get(row.tierId);

  return {
    ...row,
    tierLabel: tier?.label ?? row.tierId,
    tierPrice: tier?.price ?? '',
    tierCapacity: tier?.capacity ?? ''
  };
};

const normaliseReservationRow = (row: schema.ReservationRow): ReservationRecord => ({
  id: row.id,
  tierId: row.tierId,
  guestName: row.guestName,
  email: row.email,
  phone: row.phone ?? null,
  guestCount: row.guestCount,
  paymentIntentId: row.paymentIntentId ?? null,
  status: row.status as ReservationStatus,
  confirmationCode: row.confirmationCode,
  createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
  updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt
});

const selectConfirmedCounts = async (db: Database): Promise<ConfirmedCountRow[]> => {
  const rows = await db
    .select({
      tierId: reservationsTable.tierId,
      confirmed: sql<number>`COUNT(*)`
    })
    .from(reservationsTable)
    .where(eq(reservationsTable.status, 'confirmed'))
    .groupBy(reservationsTable.tierId);

  return rows.map((row) => ({ tierId: row.tierId, confirmed: Number(row.confirmed) }));
};

export const getReservationAvailability = async (): Promise<ReservationAvailability> => {
  const db = getDb();
  const result = await db
    .select({ reservation: siteContentTable.reservation })
    .from(siteContentTable)
    .where(eq(siteContentTable.id, DEFAULT_SITE_CONTENT_ID))
    .limit(1);

  if (!result.length) {
    throw new Error('Site content has not been initialised.');
  }

  const [record] = result;
  const confirmed = await selectConfirmedCounts(db);
  return buildAvailability(record.reservation, confirmed);
};

export const createReservation = async (
  payload: CreateReservationPayload
): Promise<CreateReservationResult> => {
  const db = getDb();

  return db.transaction(async (tx) => {
    const reservationContent = await fetchReservationContent(tx);
    const tier = reservationContent.tableTiers.find((candidate) => candidate.id === payload.tierId);

    if (!tier) {
      throw new ReservationTierNotFoundError();
    }

    const baseReserved = Math.min(tier.reserved, tier.total);
    const lockedRows = await tx.execute(
      sql`SELECT id FROM reservations WHERE tier_id = ${tier.id} AND status = 'confirmed' FOR UPDATE`
    );
    const confirmedCount = lockedRows.rows.length;
    const remaining = tier.total - baseReserved - confirmedCount;

    if (remaining <= 0) {
      throw new ReservationSoldOutError();
    }

    const reservationId = randomUUID();
    const confirmationCode = generateConfirmationCode(tier.id);
    const now = new Date();

    await tx.insert(reservationsTable).values({
      id: reservationId,
      tierId: tier.id,
      guestName: payload.guestName.trim(),
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone?.trim() || null,
      guestCount: payload.guestCount,
      paymentIntentId: payload.paymentIntentId ?? null,
      status: 'confirmed',
      confirmationCode,
      createdAt: now,
      updatedAt: now
    });

    const confirmed = await selectConfirmedCounts(tx);
    const availability = buildAvailability(reservationContent, confirmed);

    return {
      reservation: {
        id: reservationId,
        confirmationCode,
        status: 'confirmed'
      },
      availability
    } satisfies CreateReservationResult;
  });
};

export const listReservations = async (
  params: AdminReservationQuery = {}
): Promise<ReservationWithTierSummary[]> => {
  const db = getDb();
  const reservationContent = await fetchReservationContentSnapshot(db);
  const lookup = buildTierLookup(reservationContent);

  const safeLimit = Math.min(Math.max(params.limit ?? 100, 1), 500);

  const rows = params.status
    ? await db
        .select()
        .from(reservationsTable)
        .where(eq(reservationsTable.status, params.status))
        .orderBy(desc(reservationsTable.createdAt))
        .limit(safeLimit)
    : await db
        .select()
        .from(reservationsTable)
        .orderBy(desc(reservationsTable.createdAt))
        .limit(safeLimit);

  return rows.map((row) => mapReservationWithTier(normaliseReservationRow(row), lookup));
};

export const updateReservationStatus = async (
  id: string,
  payload: UpdateReservationStatusPayload
): Promise<ReservationWithTierSummary> => {
  const db = getDb();
  const reservationContent = await fetchReservationContentSnapshot(db);
  const lookup = buildTierLookup(reservationContent);
  const timestamp = new Date();

  const [updated] = await db
    .update(reservationsTable)
    .set({ status: payload.status as ReservationStatus, updatedAt: timestamp })
    .where(eq(reservationsTable.id, id))
    .returning();

  if (!updated) {
    throw new ReservationNotFoundError();
  }

  return mapReservationWithTier(normaliseReservationRow(updated), lookup);
};
