import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { SiteContent } from '../types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.resolve(__dirname, '../../data/siteContent.json');

let cache: SiteContent | null = null;

const readContent = async (): Promise<SiteContent> => {
  if (cache) {
    return cache;
  }

  const raw = await readFile(dataPath, 'utf8');
  cache = JSON.parse(raw) as SiteContent;
  return cache;
};

export const getSiteContent = async (): Promise<SiteContent> => readContent();

export const saveSiteContent = async (content: SiteContent): Promise<void> => {
  cache = content;
  const serialised = JSON.stringify(content, null, 2);
  await writeFile(dataPath, `${serialised}\n`, 'utf8');
};
