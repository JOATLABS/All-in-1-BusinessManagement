import { useEffect, useMemo, useState } from 'react';
import type { SiteContent } from '../types/content';
import { defaultSiteContent } from '../config/defaultSiteContent';

const parseDate = (value: string | Date) => (value instanceof Date ? value : new Date(value));

const normaliseContent = (content: SiteContent): SiteContent => ({
  hero: {
    ...content.hero,
    backgrounds: content.hero.backgrounds.map((background) => ({
      ...background,
      focalPoint: background.focalPoint ?? { x: 50, y: 50 }
    }))
  },
  event: {
    ...content.event,
    start: parseDate(content.event.start),
    end: parseDate(content.event.end)
  },
  footer: content.footer
});

export const useSiteContent = () => {
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadContent = async () => {
      try {
        const response = await fetch('/site-content.json', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`Failed to load site content: ${response.status}`);
        }
        const payload = (await response.json()) as SiteContent;
        if (isMounted) {
          setContent(normaliseContent(payload));
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    };

    void loadContent();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo(() => ({ content, isReady }), [content, isReady]);
  return value;
};
