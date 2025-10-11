import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { registerAuthRoutes } from './routes/auth.js';
import { registerSiteContentRoutes } from './routes/siteContent.js';
import { registerReservationRoutes } from './routes/reservations.js';
import { registerAdminReservationRoutes } from './routes/adminReservations.js';
import { eventsRouter } from './routes/events.js';
import { ticketsRouter } from './routes/tickets.js';

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN ?? true,
      credentials: false
    })
  );
  app.use(express.json({ limit: '1mb' }));

  const router = express.Router();
  registerAuthRoutes(router);
  registerSiteContentRoutes(router);
  registerReservationRoutes(router);
  registerAdminReservationRoutes(router);

  // Single-tenant event and ticketing routes (no club_id in URLs)
  router.use('/events', eventsRouter);
  router.use('/tickets', ticketsRouter);

  app.use('/api/v1', router);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  return app;
};
