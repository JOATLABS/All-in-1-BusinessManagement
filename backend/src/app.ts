import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { log } from './config/logger.js';
import { correlationIdMiddleware } from './middleware/correlationId.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { registerAuthRoutes } from './routes/auth.js';
import { registerSiteContentRoutes } from './routes/siteContent.js';
import { registerReservationRoutes } from './routes/reservations.js';
import { registerAdminReservationRoutes } from './routes/adminReservations.js';
import { registerAdminUserRoutes } from './routes/adminUsers.js';
import { eventsRouter } from './routes/events.js';
import { ticketsRouter } from './routes/tickets.js';
import { mediaRouter } from './routes/media.js';

export const createApp = () => {
  const app = express();

  // Security middleware
  app.use(helmet());

  // CORS configuration with environment variables
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) {
          return callback(null, true);
        }

        // Check if origin is in allowed list
        if (env.CORS_ORIGINS.includes(origin)) {
          return callback(null, true);
        }

        // Development: allow all localhost
        if (env.NODE_ENV === 'development' && origin.includes('localhost')) {
          return callback(null, true);
        }

        callback(new Error('Not allowed by CORS'));
      },
      credentials: true, // Allow cookies/authorization headers
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
      exposedHeaders: ['X-Request-ID'],
    })
  );

  // Body parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Correlation ID middleware (must be early in chain)
  app.use(correlationIdMiddleware);

  // HTTP request logging
  app.use((req, _res, next) => {
    log.http(`${req.method} ${req.path}`, {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    next();
  });

  // Health check endpoint (before routes)
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    });
  });

  // API routes
  const router = express.Router();
  registerAuthRoutes(router);
  registerSiteContentRoutes(router);
  registerReservationRoutes(router);
  registerAdminReservationRoutes(router);
  registerAdminUserRoutes(router);

  // Single-tenant event and ticketing routes (no club_id in URLs)
  router.use('/events', eventsRouter);
  router.use('/tickets', ticketsRouter);
  router.use('/media', mediaRouter); // Cloudflare R2 media uploads

  app.use('/api/v1', router);

  // 404 handler (must be after all routes)
  app.use(notFoundHandler);

  // Centralized error handler (must be last)
  app.use(errorHandler);

  return app;
};
