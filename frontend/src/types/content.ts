export interface BackgroundImage {
  src: string;
  alt: string;
  focalPoint?: {
    x: number;
    y: number;
  };
}

export type HeroBackground = BackgroundImage;

export interface HeroContent {
  name: string;
  tagline: string;
  words: string[];
  backgrounds: BackgroundImage[];
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

export interface ReservationContent {
  title: string;
  subtitle: string;
  intro: string;
  availabilityNote: string;
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
