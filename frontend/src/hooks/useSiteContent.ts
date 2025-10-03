import { useEffect, useState } from 'react';
import { defaultSiteContent } from '../config/defaultSiteContent';
import type { RawSiteContent, SiteContent } from '../types/content';

const normaliseContent = (raw: RawSiteContent): SiteContent => ({
  hero: raw.hero,
  event: {
    ...raw.event,
    start: new Date(raw.event.start),
    end: new Date(raw.event.end)
  },
  footer: raw.footer
});

const mergeContent = (fallback: RawSiteContent, incoming?: Partial<RawSiteContent>): RawSiteContent => ({
  hero: { ...fallback.hero, ...(incoming?.hero ?? {}) },
  event: { ...fallback.event, ...(incoming?.event ?? {}) },
  footer: { ...fallback.footer, ...(incoming?.footer ?? {}) }
});

export const useSiteContent = () => {
  const [content, setContent] = useState<SiteContent>(() => normaliseContent(defaultSiteContent));
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch('/site-content.json', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`Failed to load site content: ${response.status}`);
        }
        const data = (await response.json()) as Partial<RawSiteContent>;
        if (!cancelled) {
          setContent(normaliseContent(mergeContent(defaultSiteContent, data)));
        }
      } catch (error) {
        if (!cancelled) {
          console.warn('[site-content] falling back to default configuration', error);
        }
      } finally {
        if (!cancelled) {
          setIsReady(true);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { content, isReady };
};
