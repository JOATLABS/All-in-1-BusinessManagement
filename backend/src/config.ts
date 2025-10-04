import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const moduleDir = fileURLToPath(new URL('.', import.meta.url));

const readPackageName = (packageJsonPath: string): string | null => {
  try {
    const raw = readFileSync(packageJsonPath, 'utf8');
    const parsed = JSON.parse(raw) as { name?: unknown };

    if (parsed && typeof parsed === 'object' && typeof parsed.name === 'string') {
      return parsed.name;
    }
  } catch (error) {
    console.warn(`Failed to inspect package.json at ${packageJsonPath}:`, error);
  }

  return null;
};

const findProjectRoot = () => {
  let current = moduleDir;
  const { root } = path.parse(current);

  while (true) {
    const packageJsonPath = path.join(current, 'package.json');
    if (existsSync(packageJsonPath)) {
      const packageName = readPackageName(packageJsonPath);
      if (packageName === 'ojaplus-backend') {
        return current;
      }
    }

    if (current === root) {
      break;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }

    current = parent;
  }

  throw new Error('Unable to resolve backend project root');
};

const projectRoot = findProjectRoot();

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
