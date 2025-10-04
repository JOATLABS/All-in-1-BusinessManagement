import path from 'node:path';
import { fileURLToPath } from 'node:url';

const moduleDir = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = path.resolve(moduleDir, '..');

export const resolveProjectPath = (target: string) =>
  path.isAbsolute(target) ? target : path.resolve(projectRoot, target);

const resolveSeedDataDir = () => {
  const configured = process.env.SEED_DATA_DIR?.trim();
  if (configured && configured.length > 0) {
    return resolveProjectPath(configured);
  }

  return path.join(projectRoot, 'data');
};

const resolveDatabaseUrl = () => {
  const url = process.env.DATABASE_URL;
  if (!url || url.trim().length === 0) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  return url;
};

export const config = {
  port: Number(process.env.PORT ?? 4000),
  sessionTtlMs: 1000 * 60 * 60 * 8,
  databaseUrl: resolveDatabaseUrl(),
  seedDataDir: resolveSeedDataDir(),
  projectRoot
};
