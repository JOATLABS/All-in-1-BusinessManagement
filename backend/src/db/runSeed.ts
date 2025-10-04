import 'dotenv/config';
import { initializeDatabase } from './index.js';
import { ensureSeedData } from './seed.js';

const run = async () => {
  const db = await initializeDatabase();
  await ensureSeedData(db);
  console.log('Seed data ensured successfully.');
};

run().catch((error) => {
  console.error('Failed to seed database', error);
  process.exit(1);
});
