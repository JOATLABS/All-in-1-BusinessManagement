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

export interface ReserveOverlayContent {
  title: string;
  subtitle: string;
  intro: string;
  bullets: string[];
  emailCta: { label: string; href: string };
  hotlineLabel: string;
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
  reserve: ReserveOverlayContent;
  tickets: TicketsOverlayContent;
  contact: ContactOverlayContent;
  legal: LegalOverlayContent;
}

export interface SiteContent {
  hero: HeroContent;
  event: EventContent;
  footer: FooterContent;
  overlays: OverlaysContent;
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
