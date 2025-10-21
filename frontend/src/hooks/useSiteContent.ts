import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  BackgroundImage,
  HeroLogoAsset,
  HeroLogoKind,
  HeroLogoSource,
  ReservationTierPattern,
  SiteContent
} from '../types/content';
import { defaultSiteContent } from '../config/defaultSiteContent';
import { fetchSiteContent, type SiteContentResponse } from '../services/contentService';

const parseDate = (value: string | Date) => (value instanceof Date ? value : new Date(value));

const ensureArray = <T>(value: T[] | undefined, fallback: T[]): T[] =>
  value && value.length ? value : fallback;

const parseNonNegativeInt = (value: unknown, fallback: number): number => {
  const numeric = typeof value === 'number' ? value : Number.parseInt(String(value), 10);

  if (!Number.isFinite(numeric) || Number.isNaN(numeric) || numeric < 0) {
    return fallback;
  }

  return Math.floor(numeric);
};

const reservationPatterns: ReservationTierPattern[] = ['grid', 'halo', 'pillars'];

const inferLogoKind = (src: string, fallback?: HeroLogoKind): HeroLogoKind => {
  const extension = src.split('?')[0]?.split('.').pop()?.toLowerCase();
  if (!extension) {
    return fallback ?? 'image';
  }

  if (['mp4', 'webm', 'mov', 'm4v'].includes(extension)) {
    return 'video';
  }

  if (['glb', 'gltf', 'gbl'].includes(extension)) {
    return 'model';
  }

  if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif', 'heic', 'heif'].includes(extension)) {
    return 'image';
  }

  return fallback ?? 'image';
};

const resolveLogoSource = (src: string, explicit?: HeroLogoSource): HeroLogoSource => {
  if (explicit) {
    return explicit;
  }

  return src.startsWith('http://') || src.startsWith('https://') ? 'remote' : 'local';
};

const normaliseLogo = (logo: HeroLogoAsset | undefined, legacyUrl?: string): HeroLogoAsset | undefined => {
  const trimmedLegacy = legacyUrl?.trim();
  const trimmedSrc = logo?.src?.trim();

  if (trimmedSrc) {
    const kind = inferLogoKind(trimmedSrc, logo?.kind);
    const posterUrl = logo?.posterUrl?.trim() || undefined;
    const source = resolveLogoSource(trimmedSrc, logo?.source);

    return {
      src: trimmedSrc,
      kind,
      posterUrl,
      source
    };
  }

  if (trimmedLegacy) {
    const kind = inferLogoKind(trimmedLegacy, 'image');
    const source = resolveLogoSource(trimmedLegacy);

    return {
      src: trimmedLegacy,
      kind,
      source
    };
  }

  return undefined;
};

const normaliseContent = (content: SiteContent): SiteContent => ({
  hero: {
    ...content.hero,
    backgrounds: ensureArray(content.hero.backgrounds, defaultSiteContent.hero.backgrounds)
      .map((background, index) => ({ background, index }))
      .sort((a, b) => {
        const orderA = typeof a.background.order === 'number' && Number.isFinite(a.background.order)
          ? a.background.order
          : a.index;
        const orderB = typeof b.background.order === 'number' && Number.isFinite(b.background.order)
          ? b.background.order
          : b.index;

        if (orderA === orderB) {
          return a.index - b.index;
        }

        return orderA - orderB;
      })
      .map(({ background }, index) => {
        const src = background.src?.trim() ?? '';
        const srcExt = src.split('?')[0]?.split('.').pop()?.toLowerCase();
        const derivedMediaType = srcExt && ['mp4', 'webm', 'mov', 'm4v'].includes(srcExt) ? 'video' : 'image';
        const mediaType = background.mediaType === 'video' ? 'video' : derivedMediaType;
        const fallbackImage = background.fallbackImage?.trim() || undefined;
        const focalPoint = background.focalPoint ?? { x: 50, y: 50 };

        const normalised: BackgroundImage = {
          ...background,
          src,
          alt: background.alt?.trim() || `Background ${index + 1}`,
          mediaType,
          isActive: background.isActive ?? true,
          playbackDepth: background.playbackDepth ?? 'medium',
          focalPoint,
          fallbackImage,
          order: index,
        };

        if (mediaType === 'video') {
          normalised.loop = background.loop ?? true;
          normalised.autoplay = background.autoplay ?? true;
          normalised.muted = background.muted ?? true;
        } else {
          normalised.loop = undefined;
          normalised.autoplay = undefined;
          normalised.muted = undefined;
        }

        return normalised;
      }),
    words: ensureArray(content.hero.words, defaultSiteContent.hero.words)
      .map((word) => word.trim())
      .filter(Boolean),
    ...((): { logo?: HeroLogoAsset; logoUrl?: string } => {
      const resolvedLogo = normaliseLogo(content.hero.logo, content.hero.logoUrl);

      if (!resolvedLogo) {
        return { logo: undefined, logoUrl: undefined };
      }

      return {
        logo: resolvedLogo,
        logoUrl: resolvedLogo.kind === 'image' ? resolvedLogo.src : resolvedLogo.posterUrl ?? undefined
      };
    })()
  },
  event: {
    ...content.event,
    start: parseDate(content.event.start),
    end: parseDate(content.event.end)
  },
  footer: {
    socials: ensureArray(content.footer?.socials, defaultSiteContent.footer.socials)
  },
  reservation: (() => {
    const fallback = defaultSiteContent.reservation;
    const source = content.reservation ?? fallback;

    const availability = source.availability ?? fallback.availability;
    const carousel = source.carousel ?? fallback.carousel;
    const modal = source.modal ?? fallback.modal;

    const paymentSteps = ensureArray(source.paymentSteps, fallback.paymentSteps);

    const tableTiers = (() => {
      const fallbackTiers = fallback.tableTiers;
      const sourceTiers = ensureArray(source.tableTiers, fallbackTiers);

      return sourceTiers.map((tier, index) => {
        const fallbackTier = fallbackTiers[index] ?? fallbackTiers[0];
        const total = parseNonNegativeInt(tier.total, fallbackTier.total);
        const reserved = Math.min(parseNonNegativeInt(tier.reserved, fallbackTier.reserved), total);
        const pattern = reservationPatterns.includes(tier.visual?.pattern as ReservationTierPattern)
          ? tier.visual.pattern
          : fallbackTier.visual.pattern;

        return {
          id: tier.id?.trim() ? tier.id : fallbackTier.id,
          label: tier.label ?? fallbackTier.label,
          capacity: tier.capacity ?? fallbackTier.capacity,
          description: tier.description ?? fallbackTier.description,
          price: tier.price ?? fallbackTier.price,
          total,
          reserved,
          visual: {
            pattern,
            primaryColor: tier.visual?.primaryColor?.trim() ?? fallbackTier.visual.primaryColor,
            secondaryColor: tier.visual?.secondaryColor?.trim() ?? fallbackTier.visual.secondaryColor,
            accentColor: tier.visual?.accentColor?.trim() ?? fallbackTier.visual.accentColor
          }
        };
      });
    })();

    return {
      title: source.title ?? fallback.title,
      subtitle: source.subtitle ?? fallback.subtitle,
      heroEyebrow: source.heroEyebrow ?? fallback.heroEyebrow,
      backLinkLabel: source.backLinkLabel ?? fallback.backLinkLabel,
      intro: source.intro ?? fallback.intro,
      availabilityNote: source.availabilityNote ?? fallback.availabilityNote,
      availability: {
        heading: availability.heading ?? fallback.availability.heading,
        liveTag: availability.liveTag ?? fallback.availability.liveTag,
        loadingLabel: availability.loadingLabel ?? fallback.availability.loadingLabel,
        openLabel: availability.openLabel ?? fallback.availability.openLabel,
        reservedLabel: availability.reservedLabel ?? fallback.availability.reservedLabel,
        totalLabel: availability.totalLabel ?? fallback.availability.totalLabel
      },
      carousel: {
        heading: carousel.heading ?? fallback.carousel.heading,
        previousLabel: carousel.previousLabel ?? fallback.carousel.previousLabel,
        nextLabel: carousel.nextLabel ?? fallback.carousel.nextLabel,
        availableLabel: carousel.availableLabel ?? fallback.carousel.availableLabel,
        reserveButtonLabel: carousel.reserveButtonLabel ?? fallback.carousel.reserveButtonLabel,
        soldOutLabel: carousel.soldOutLabel ?? fallback.carousel.soldOutLabel
      },
      modal: {
        stepsHeading: modal.stepsHeading ?? fallback.modal.stepsHeading,
        detailsHeading: modal.detailsHeading ?? fallback.modal.detailsHeading,
        paymentHeading: modal.paymentHeading ?? fallback.modal.paymentHeading,
        confirmationCodeLabel: modal.confirmationCodeLabel ?? fallback.modal.confirmationCodeLabel,
        detailsCtaLabel: modal.detailsCtaLabel ?? fallback.modal.detailsCtaLabel,
        paymentCtaLabel: modal.paymentCtaLabel ?? fallback.modal.paymentCtaLabel,
        paymentProcessingLabel: modal.paymentProcessingLabel ?? fallback.modal.paymentProcessingLabel,
        confirmationCtaLabel: modal.confirmationCtaLabel ?? fallback.modal.confirmationCtaLabel
      },
      paymentSteps,
      confirmationHeadline: source.confirmationHeadline ?? fallback.confirmationHeadline,
      confirmationSubtext: source.confirmationSubtext ?? fallback.confirmationSubtext,
      tableTiers
    };
  })(),
  overlays: {
    about: {
      title: content.overlays?.about.title ?? defaultSiteContent.overlays.about.title,
      subtitle: content.overlays?.about.subtitle ?? defaultSiteContent.overlays.about.subtitle,
      paragraphs: ensureArray(content.overlays?.about.paragraphs, defaultSiteContent.overlays.about.paragraphs),
      hours: ensureArray(content.overlays?.about.hours, defaultSiteContent.overlays.about.hours)
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
  reservation: payload.reservation,
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
