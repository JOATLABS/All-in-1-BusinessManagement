import { Router, type Request, type Response } from 'express';
import { eq, and, sql } from 'drizzle-orm';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { getDb } from '../db/index.js';
import { ticketsTable, customersTable, eventsTable, attendanceEventsTable } from '../db/schema.js';
import { requireAuth } from '../services/sessionService.js';

const router = Router();

/**
 * Generate unique QR code string
 * Format: TICKET-{eventSlug}-{shortHash}
 */
const generateQRCode = async (ticketId: string, eventId: string): Promise<{ qrCode: string; qrDataUrl: string }> => {
  const hash = crypto.createHash('sha256').update(`${ticketId}-${eventId}-${Date.now()}`).digest('hex').substring(0, 12);
  const qrCode = `TICKET-${eventId}-${hash}`.toUpperCase();

  // Generate QR code as data URL
  const qrDataUrl = await QRCode.toDataURL(qrCode, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    width: 400,
    margin: 2
  });

  return { qrCode, qrDataUrl };
};

/**
 * Find or create customer record for forecasting
 * Single-tenant: simple upsert, no tenant context
 */
const upsertCustomer = async (email: string, name?: string, phone?: string) => {
  const db = getDb();

  // Check if customer exists
  const existing = await db
    .select()
    .from(customersTable)
    .where(eq(customersTable.email, email))
    .limit(1);

  if (existing.length > 0) {
    // Update name/phone if provided
    if (name || phone) {
      await db
        .update(customersTable)
        .set({
          name: name || existing[0].name,
          phone: phone || existing[0].phone,
          updatedAt: new Date()
        })
        .where(eq(customersTable.id, existing[0].id));
    }
    return existing[0].id;
  }

  // Create new customer
  const newCustomer = await db
    .insert(customersTable)
    .values({
      email,
      name,
      phone,
      firstVisitDate: new Date()
    })
    .returning();

  return newCustomer[0].id;
};

/**
 * POST /api/v1/events/:eventId/rsvp
 * Free RSVP for event (generates QR code)
 * Single-tenant: no club_id, all RSVPs for the one venue
 */
router.post('/:eventId/rsvp', async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const { guestName, guestEmail, guestPhone } = req.body;

    // Validation
    if (!guestName || !guestEmail) {
      return res.status(400).json({
        error: 'Missing required fields: guestName, guestEmail'
      });
    }

    const db = getDb();

    // Check if event exists and is free entry
    const event = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.id, eventId))
      .limit(1);

    if (event.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (!event[0].isFreeEntry) {
      return res.status(400).json({
        error: 'This event requires paid tickets. Use the ticket purchase flow instead.'
      });
    }

    // Check capacity
    if (event[0].capacity) {
      const ticketCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(ticketsTable)
        .where(
          and(
            eq(ticketsTable.eventId, eventId),
            eq(ticketsTable.status, 'issued')
          )
        );

      if (ticketCount[0].count >= event[0].capacity) {
        return res.status(409).json({ error: 'Event is at capacity' });
      }
    }

    // Find or create customer
    const customerId = await upsertCustomer(guestEmail, guestName, guestPhone);

    // Generate unique ticket ID first
    const ticketResult = await db
      .insert(ticketsTable)
      .values({
        eventId,
        customerId,
        guestName,
        guestEmail,
        guestPhone,
        ticketType: 'free_rsvp',
        qrCode: 'PENDING', // Temporary, will update
        status: 'issued',
        amountPaid: '0'
      })
      .returning();

    const ticket = ticketResult[0];

    // Generate QR code
    const { qrCode, qrDataUrl } = await generateQRCode(ticket.id, event[0].slug);

    // Update ticket with QR code
    const updatedTicket = await db
      .update(ticketsTable)
      .set({
        qrCode,
        qrCodeImageUrl: qrDataUrl
      })
      .where(eq(ticketsTable.id, ticket.id))
      .returning();

    // Create attendance event for forecasting
    await db.insert(attendanceEventsTable).values({
      customerId,
      eventId,
      ticketId: ticket.id,
      rsvpTimestamp: new Date()
    });

    return res.status(201).json({
      ticket: updatedTicket[0],
      event: event[0],
      message: 'RSVP confirmed! Your QR code has been generated.'
    });
  } catch (error) {
    console.error('Error creating RSVP:', error);
    return res.status(500).json({ error: 'Failed to create RSVP' });
  }
});

/**
 * POST /api/v1/tickets/validate
 * Validate and redeem QR code (door staff)
 * Single-tenant: direct query, no tenant context
 */
router.post('/validate', requireAuth, async (req: Request, res: Response) => {
  try {
    const { qrCode, redeemedBy } = req.body;

    if (!qrCode) {
      return res.status(400).json({ error: 'QR code is required' });
    }

    const db = getDb();

    // Find ticket by QR code (single-tenant: simple query)
    const ticket = await db
      .select({
        ticket: ticketsTable,
        event: eventsTable
      })
      .from(ticketsTable)
      .innerJoin(eventsTable, eq(ticketsTable.eventId, eventsTable.id))
      .where(eq(ticketsTable.qrCode, qrCode))
      .limit(1);

    if (ticket.length === 0) {
      return res.status(404).json({
        valid: false,
        error: 'Invalid QR code'
      });
    }

    const { ticket: ticketData, event } = ticket[0];

    // Check if already redeemed
    if (ticketData.status === 'redeemed') {
      return res.status(409).json({
        valid: false,
        error: 'Ticket already redeemed',
        redeemedAt: ticketData.redeemedAt,
        redeemedBy: ticketData.redeemedBy
      });
    }

    // Check if cancelled
    if (ticketData.status === 'cancelled') {
      return res.status(403).json({
        valid: false,
        error: 'Ticket has been cancelled'
      });
    }

    // Redeem ticket
    const redeemed = await db
      .update(ticketsTable)
      .set({
        status: 'redeemed',
        redeemedAt: new Date(),
        redeemedBy: redeemedBy || 'door-staff',
        updatedAt: new Date()
      })
      .where(eq(ticketsTable.id, ticketData.id))
      .returning();

    // Update attendance event
    if (ticketData.customerId) {
      await db
        .update(attendanceEventsTable)
        .set({
          attended: true,
          scanTimestamp: new Date()
        })
        .where(eq(attendanceEventsTable.ticketId, ticketData.id));

      // Update customer stats
      await db
        .update(customersTable)
        .set({
          totalVisits: sql`${customersTable.totalVisits} + 1`,
          lastVisitDate: new Date(),
          updatedAt: new Date()
        })
        .where(eq(customersTable.id, ticketData.customerId));
    }

    return res.json({
      valid: true,
      ticket: redeemed[0],
      event,
      message: `Welcome, ${ticketData.guestName}!`
    });
  } catch (error) {
    console.error('Error validating ticket:', error);
    return res.status(500).json({ error: 'Failed to validate ticket' });
  }
});

/**
 * GET /api/v1/admin/tickets
 * List all tickets (admin only)
 * Single-tenant: returns all tickets for the venue
 */
router.get('/admin/tickets', requireAuth, async (req: Request, res: Response) => {
  try {
    const { eventId, status } = req.query;
    const db = getDb();

    let query = db
      .select({
        ticket: ticketsTable,
        event: eventsTable
      })
      .from(ticketsTable)
      .innerJoin(eventsTable, eq(ticketsTable.eventId, eventsTable.id));

    // Apply filters
    const conditions = [];
    if (eventId) {
      conditions.push(eq(ticketsTable.eventId, eventId as string));
    }
    if (status) {
      conditions.push(eq(ticketsTable.status, status as string));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const tickets = await query;

    return res.json({ tickets });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

/**
 * GET /api/v1/tickets/:qrCode
 * Check ticket status (public route for guests to verify their ticket)
 * Single-tenant: simple lookup
 */
router.get('/:qrCode', async (req: Request, res: Response) => {
  try {
    const { qrCode } = req.params;
    const db = getDb();

    const ticket = await db
      .select({
        ticket: ticketsTable,
        event: eventsTable
      })
      .from(ticketsTable)
      .innerJoin(eventsTable, eq(ticketsTable.eventId, eventsTable.id))
      .where(eq(ticketsTable.qrCode, qrCode))
      .limit(1);

    if (ticket.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    return res.json({
      ticket: ticket[0].ticket,
      event: ticket[0].event
    });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

export { router as ticketsRouter };
