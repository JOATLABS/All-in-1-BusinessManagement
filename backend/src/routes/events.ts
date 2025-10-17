import { Router, type Request, type Response } from 'express';
import { eq, desc, gte } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { eventsTable } from '../db/schema.js';
import { authenticateRequest } from '../middleware/authenticate.js';
import { requireRole } from '../middleware/authorize.js';
import { log } from '../config/logger.js';

const router = Router();

/**
 * GET /api/v1/events
 * List all upcoming events (public route)
 * Single-tenant: no club_id filtering
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const db = getDb();
    const now = new Date();

    // Get all upcoming events, ordered by start date
    const events = await db
      .select()
      .from(eventsTable)
      .where(gte(eventsTable.endsAt, now))
      .orderBy(desc(eventsTable.isFeatured), eventsTable.startsAt);

    return res.json({ events });
  } catch (error) {
    log.error('Error fetching events', error, {
      path: req.path,
    });
    return res.status(500).json({ error: 'Failed to fetch events' });
  }
});

/**
 * GET /api/v1/events/:slug
 * Get event details by slug (public route)
 * Single-tenant: direct query, no tenant context
 */
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const db = getDb();

    const event = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.slug, slug))
      .limit(1);

    if (event.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    return res.json({ event: event[0] });
  } catch (error) {
    log.error('Error fetching event', error, {
      path: req.path,
      slug: req.params.slug,
    });
    return res.status(500).json({ error: 'Failed to fetch event' });
  }
});

/**
 * POST /api/v1/events (admin route)
 * Create new event (superadmin and admin only)
 * Single-tenant: no club_id needed
 */
router.post('/', authenticateRequest, requireRole(['superadmin', 'admin']), async (req: Request, res: Response) => {
  try {
    const {
      title,
      slug,
      description,
      startsAt,
      endsAt,
      isFreeEntry = true,
      requiresRsvp = false,
      capacity,
      isFeatured = false,
      flyerUrl,
      ticketUrl
    } = req.body;

    // Basic validation
    if (!title || !slug || !startsAt || !endsAt) {
      return res.status(400).json({
        error: 'Missing required fields: title, slug, startsAt, endsAt'
      });
    }

    const db = getDb();

    // Check if slug already exists (single-tenant: simple query)
    const existing = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.slug, slug))
      .limit(1);

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Event with this slug already exists' });
    }

    // Create event
    const newEvent = await db
      .insert(eventsTable)
      .values({
        title,
        slug,
        description,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        isFreeEntry,
        requiresRsvp,
        capacity,
        isFeatured,
        flyerUrl,
        ticketUrl
      })
      .returning();

    return res.status(201).json({ event: newEvent[0] });
  } catch (error) {
    log.error('Error creating event', error, {
      requestId: req.requestId,
      userId: req.user?.userId,
    });
    return res.status(500).json({ error: 'Failed to create event' });
  }
});

/**
 * PATCH /api/v1/admin/events/:id
 * Update event (superadmin and admin only)
 * Single-tenant: direct update, no tenant checks
 */
router.patch('/:id', authenticateRequest, requireRole(['superadmin', 'admin']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const db = getDb();

    // Update event
    const updated = await db
      .update(eventsTable)
      .set({
        ...updates,
        startsAt: updates.startsAt ? new Date(updates.startsAt) : undefined,
        endsAt: updates.endsAt ? new Date(updates.endsAt) : undefined,
        updatedAt: new Date()
      })
      .where(eq(eventsTable.id, id))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    return res.json({ event: updated[0] });
  } catch (error) {
    log.error('Error updating event', error, {
      requestId: req.requestId,
      userId: req.user?.userId,
      eventId: req.params.id,
    });
    return res.status(500).json({ error: 'Failed to update event' });
  }
});

/**
 * DELETE /api/v1/admin/events/:id
 * Delete event (superadmin and admin only)
 * Single-tenant: direct delete, no tenant authorization
 */
router.delete('/:id', authenticateRequest, requireRole(['superadmin', 'admin']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDb();

    const deleted = await db
      .delete(eventsTable)
      .where(eq(eventsTable.id, id))
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    return res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    log.error('Error deleting event', error, {
      requestId: req.requestId,
      userId: req.user?.userId,
      eventId: req.params.id,
    });
    return res.status(500).json({ error: 'Failed to delete event' });
  }
});

export { router as eventsRouter };
