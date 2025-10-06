import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { registerAuthRoutes } from './routes/auth.js';
import { registerSiteContentRoutes } from './routes/siteContent.js';
import { registerReservationRoutes } from './routes/reservations.js';
import { registerAdminReservationRoutes } from './routes/adminReservations.js';

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

  app.use('/api/v1', router);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  return app;
};
