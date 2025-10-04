import { createServer } from 'node:http';
import { config } from './config.js';
import { createApp } from './app.js';

const app = createApp();
const server = createServer(app);

server.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${config.port}`);
});
