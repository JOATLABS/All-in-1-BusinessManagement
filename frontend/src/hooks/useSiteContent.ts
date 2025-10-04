import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SiteContent } from '../types/content';
import { defaultSiteContent } from '../config/defaultSiteContent';
import { fetchSiteContent, type SiteContentResponse } from '../services/contentService';

const parseDate = (value: string | Date) => (value instanceof Date ? value : new Date(value));

const ensureArray = <T>(value: T[] | undefined, fallback: T[]): T[] =>
  value && value.length ? value : fallback;

const normaliseContent = (content: SiteContent): SiteContent => ({
  hero: {
    ...content.hero,
    backgrounds: ensureArray(content.hero.backgrounds, defaultSiteContent.hero.backgrounds).map((background) => ({
      ...background,
      focalPoint: background.focalPoint ?? { x: 50, y: 50 }
    })),
    words: ensureArray(content.hero.words, defaultSiteContent.hero.words)
  },
  event: {
    ...content.event,
    start: parseDate(content.event.start),
    end: parseDate(content.event.end)
  },
  footer: {
    socials: ensureArray(content.footer?.socials, defaultSiteContent.footer.socials)
  },
  overlays: {
    about: {
      title: content.overlays?.about.title ?? defaultSiteContent.overlays.about.title,
      subtitle: content.overlays?.about.subtitle ?? defaultSiteContent.overlays.about.subtitle,
      paragraphs: ensureArray(content.overlays?.about.paragraphs, defaultSiteContent.overlays.about.paragraphs),
      hours: ensureArray(content.overlays?.about.hours, defaultSiteContent.overlays.about.hours)
    },
    reserve: {
      title: content.overlays?.reserve.title ?? defaultSiteContent.overlays.reserve.title,
      subtitle: content.overlays?.reserve.subtitle ?? defaultSiteContent.overlays.reserve.subtitle,
      intro: content.overlays?.reserve.intro ?? defaultSiteContent.overlays.reserve.intro,
      bullets: ensureArray(content.overlays?.reserve.bullets, defaultSiteContent.overlays.reserve.bullets),
      emailCta: content.overlays?.reserve.emailCta ?? defaultSiteContent.overlays.reserve.emailCta,
      hotlineLabel: content.overlays?.reserve.hotlineLabel ?? defaultSiteContent.overlays.reserve.hotlineLabel
    },
    tickets: {
      title: content.overlays?.tickets.title ?? defaultSiteContent.overlays.tickets.title,
      subtitle: content.overlays?.tickets.subtitle ?? defaultSiteContent.overlays.tickets.subtitle,
      ticketCopy: content.overlays?.tickets.ticketCopy ?? defaultSiteContent.overlays.tickets.ticketCopy,
      fallbackCopy: content.overlays?.tickets.fallbackCopy ?? defaultSiteContent.overlays.tickets.fallbackCopy,
      ctaLabel: content.overlays?.tickets.ctaLabel ?? defaultSiteContent.overlays.tickets.ctaLabel,
      ctaUrl: content.overlays?.tickets.ctaUrl ?? defaultSiteContent.overlays.tickets.ctaUrl
    },
    contact: {
      eyebrow: content.overlays?.contact.eyebrow ?? defaultSiteContent.overlays.contact.eyebrow,
      title: content.overlays?.contact.title ?? defaultSiteContent.overlays.contact.title,
      subtitle: content.overlays?.contact.subtitle ?? defaultSiteContent.overlays.contact.subtitle,
      topics: ensureArray(content.overlays?.contact.topics, defaultSiteContent.overlays.contact.topics),
      messagePlaceholder:
        content.overlays?.contact.messagePlaceholder ?? defaultSiteContent.overlays.contact.messagePlaceholder,
      submitLabel: content.overlays?.contact.submitLabel ?? defaultSiteContent.overlays.contact.submitLabel
    },
    legal: {
      title: content.overlays?.legal.title ?? defaultSiteContent.overlays.legal.title,
      subtitle: content.overlays?.legal.subtitle ?? defaultSiteContent.overlays.legal.subtitle,
      terms: ensureArray(content.overlays?.legal.terms, defaultSiteContent.overlays.legal.terms),
      privacyPlaceholder:
        content.overlays?.legal.privacyPlaceholder ?? defaultSiteContent.overlays.legal.privacyPlaceholder
    }
  }
});

const fromResponse = (payload: SiteContentResponse): SiteContent => ({
  hero: payload.hero,
  event: {
    ...payload.event,
    start: new Date(payload.event.start),
    end: new Date(payload.event.end)
  },
  footer: payload.footer,
  overlays: payload.overlays
});

export const useSiteContent = () => {
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [isReady, setIsReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setIsReady(false);
      const payload = await fetchSiteContent();
      const parsed = fromResponse(payload);
      setContent(normaliseContent(parsed));
    } catch (error) {
      console.error('Failed to fetch site content, falling back to defaults', error);
      setContent(normaliseContent(defaultSiteContent));
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      content,
      isReady,
      refresh
    }),
    [content, isReady, refresh]
  );

  return value;
};
