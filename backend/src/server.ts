import 'dotenv/config';
import { createServer } from 'node:http';
import { config } from './config.js';
import { createApp } from './app.js';
import { initializeDatabase } from './db/index.js';

const start = async () => {
  await initializeDatabase();

  const app = createApp();
  const server = createServer(app);

  server.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${config.port}`);
  });
};

start().catch((error) => {
  console.error('Failed to start API', error);
  process.exit(1);
});
