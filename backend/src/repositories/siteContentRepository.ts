import { eq } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { siteContentTable } from '../db/schema.js';
import { DEFAULT_SITE_CONTENT_ID } from '../db/seed.js';
import type { SiteContent } from '../types.js';

const mapRowToContent = (row: { hero: SiteContent['hero']; event: SiteContent['event']; footer: SiteContent['footer']; overlays: SiteContent['overlays'] }): SiteContent => ({
  hero: row.hero,
  event: row.event,
  footer: row.footer,
  overlays: row.overlays
});

export const getSiteContent = async (): Promise<SiteContent> => {
  const db = getDb();
  const [record] = await db
    .select({
      hero: siteContentTable.hero,
      event: siteContentTable.event,
      footer: siteContentTable.footer,
      overlays: siteContentTable.overlays
    })
    .from(siteContentTable)
    .where(eq(siteContentTable.id, DEFAULT_SITE_CONTENT_ID))
    .limit(1);

  if (!record) {
    throw new Error('Site content has not been initialised.');
  }

  return mapRowToContent(record);
};

export const saveSiteContent = async (content: SiteContent): Promise<void> => {
  const db = getDb();
  const timestamp = new Date();

  await db
    .update(siteContentTable)
    .set({
      hero: content.hero,
      event: content.event,
      footer: content.footer,
      overlays: content.overlays,
      updatedAt: timestamp
    })
    .where(eq(siteContentTable.id, DEFAULT_SITE_CONTENT_ID));
};
