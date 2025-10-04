import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AdminUser } from '../types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.resolve(__dirname, '../../data/adminUsers.json');

let cache: AdminUser[] | null = null;

const loadUsers = async (): Promise<AdminUser[]> => {
  if (cache) {
    return cache;
  }

  const raw = await readFile(dataPath, 'utf8');
  cache = JSON.parse(raw) as AdminUser[];
  return cache;
};

export const findAdminByEmail = async (email: string): Promise<AdminUser | undefined> => {
  const users = await loadUsers();
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
};
