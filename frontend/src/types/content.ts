/**
 * Background media type - supports both images and video
 * Single-tenant: all media belongs to the one venue
 */
export type BackgroundMediaType = 'image' | 'video';

export type MediaType = 'image' | 'video' | 'model';

export type HeroLogoKind = 'image' | 'video' | 'model';

export type HeroLogoSource = 'remote' | 'local';

export interface HeroLogoAsset {
  src: string;
  kind: HeroLogoKind;
  posterUrl?: string;
  source?: HeroLogoSource;
}

/**
 * Playback depth for parallax effect
 * - shallow: minimal movement (0.2x)
 * - medium: moderate movement (0.5x)
 * - deep: significant movement (1.0x)
 */
export type PlaybackDepth = 'shallow' | 'medium' | 'deep';

export interface BackgroundImage {
  src: string;
  alt: string;
  focalPoint?: {
    x: number;
    y: number;
  };
  /** Media type: image (JPG/PNG/WebP) or video (MP4/WebM) */
  mediaType?: BackgroundMediaType;
  /** Whether this background is active/visible */
  isActive?: boolean;
  /** Playback depth for parallax scrolling effect */
  playbackDepth?: PlaybackDepth;
  /** Order/position in the background stack (lower = behind) */
  order?: number;
  /** Video-specific: fallback image for reduced-motion or video load failure */
  fallbackImage?: string;
  /** Video-specific: whether to loop the video */
  loop?: boolean;
  /** Video-specific: whether to autoplay */
  autoplay?: boolean;
  /** Video-specific: whether to mute by default */
  muted?: boolean;
}

export type HeroBackground = BackgroundImage;

export interface HeroContent {
  name: string;
  tagline: string;
  words: string[];
  backgrounds: BackgroundImage[];
  /** Legacy logo URL maintained for backwards compatibility */
  logoUrl?: string;
  logo?: HeroLogoAsset;
}

export interface EventContent {
  name: string;
  flyer: string;
  start: Date;
  end: Date;
  description: string;
  requiresTicket: boolean;
  tableHotline: string;
  headliners?: string[];
}

export interface FooterContent {
  socials: Array<{
    name: string;
    url: string;
    icon?: 'instagram' | 'facebook' | 'tiktok' | 'x';
  }>;
}

export type FooterLink = FooterContent['socials'][number];

export interface AboutOverlayContent {
  title: string;
  subtitle: string;
  paragraphs: string[];
  hours: Array<{ label: string; value: string }>;
}

export type ReservationTierPattern = 'grid' | 'halo' | 'pillars';

export interface ReservationTierVisual {
  pattern: ReservationTierPattern;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export interface ReservationTableTier {
  id: string;
  label: string;
  capacity: string;
  description: string;
  price: string;
  total: number;
  reserved: number;
  visual: ReservationTierVisual;
}

export interface ReservationAvailabilityCopy {
  heading: string;
  liveTag: string;
  loadingLabel: string;
  openLabel: string;
  reservedLabel: string;
  totalLabel: string;
}

export interface ReservationCarouselCopy {
  heading: string;
  previousLabel: string;
  nextLabel: string;
  availableLabel: string;
  reserveButtonLabel: string;
  soldOutLabel: string;
}

export interface ReservationModalCopy {
  stepsHeading: string;
  detailsHeading: string;
  paymentHeading: string;
  confirmationCodeLabel: string;
  detailsCtaLabel: string;
  paymentCtaLabel: string;
  paymentProcessingLabel: string;
  confirmationCtaLabel: string;
}

export interface ReservationContent {
  title: string;
  subtitle: string;
  heroEyebrow: string;
  backLinkLabel: string;
  intro: string;
  availabilityNote: string;
  availability: ReservationAvailabilityCopy;
  carousel: ReservationCarouselCopy;
  modal: ReservationModalCopy;
  paymentSteps: string[];
  confirmationHeadline: string;
  confirmationSubtext: string;
  tableTiers: ReservationTableTier[];
}

export interface TicketsOverlayContent {
  title: string;
  subtitle: string;
  ticketCopy: string;
  fallbackCopy: string;
  ctaLabel: string;
  ctaUrl: string;
}

export interface ContactOverlayContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  topics: Array<{ value: string; label: string }>;
  messagePlaceholder: string;
  submitLabel: string;
}

export interface LegalOverlayContent {
  title: string;
  subtitle: string;
  terms: string[];
  privacyPlaceholder: string;
}

export interface OverlaysContent {
  about: AboutOverlayContent;
  tickets: TicketsOverlayContent;
  contact: ContactOverlayContent;
  legal: LegalOverlayContent;
}

export interface SiteContent {
  hero: HeroContent;
  event: EventContent;
  footer: FooterContent;
  reservation: ReservationContent;
  overlays: OverlaysContent;
}
