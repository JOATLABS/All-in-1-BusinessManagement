export interface BackgroundImage {
  src: string;
  alt: string;
  focalPoint?: {
    x: number;
    y: number;
  };
}

export interface HeroContent {
  name: string;
  tagline: string;
  words: string[];
  backgrounds: BackgroundImage[];
}

export interface EventContent {
  name: string;
  flyer: string;
  start: string;
  end: string;
  description: string;
  requiresTicket: boolean;
  tableHotline: string;
}

export interface FooterContent {
  socials: Array<{
    name: string;
    url: string;
    icon?: 'instagram' | 'facebook' | 'tiktok' | 'x';
  }>;
}

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

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled';

export interface ReservationRecord {
  id: string;
  tierId: string;
  guestName: string;
  email: string;
  phone?: string | null;
  guestCount: number;
  paymentIntentId?: string | null;
  status: ReservationStatus;
  confirmationCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  passwordHash: string;
  role: 'superadmin' | 'admin';
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string | null;
}

export interface Session {
  token: string;
  adminId: string;
  email: string;
  role: AdminUser['role'];
  expiresAt: number;
}
