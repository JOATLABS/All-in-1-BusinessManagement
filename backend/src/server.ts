import 'dotenv/config';
import { createServer } from 'node:http';
import { validateEnv, env } from './config/env.js';
import { log } from './config/logger.js';
import { createApp } from './app.js';
import { initializeDatabase } from './db/index.js';

const start = async () => {
  // Validate environment configuration first (fail fast)
  validateEnv();

  log.info('Starting OjaPlus Venture System API', {
    environment: env.NODE_ENV,
    port: env.PORT,
  });

  // Initialize database
  await initializeDatabase();
  log.info('Database initialized successfully');

  // Create Express app with all middleware
  const app = createApp();
  const server = createServer(app);

  // Start listening
  server.listen(env.PORT, () => {
    log.info(`API listening on http://localhost:${env.PORT}`, {
      environment: env.NODE_ENV,
      port: env.PORT,
    });
  });

  // Graceful shutdown handling
  const shutdown = async (signal: string) => {
    log.info(`Received ${signal}, shutting down gracefully...`);

    server.close(() => {
      log.info('HTTP server closed');
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      log.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

start().catch((error) => {
  console.error('❌ Failed to start API:', error);
  process.exit(1);
});
