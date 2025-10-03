import type { OverlayKey } from '../components/OverlayContext';

export type OverlayView = Exclude<OverlayKey, null>;

export interface HeroBackground {
  src: string;
  alt: string;
  focalPoint?: { x: number; y: number };
}

export interface HeroNavigationLink {
  id: Extract<OverlayView, 'about' | 'events' | 'reserve' | 'contact'>;
  label: string;
}

export interface HeroCtaButton {
  id: Extract<OverlayView, 'events' | 'reserve' | 'tickets' | 'contact'>;
  label: string;
}

export interface HeroContentConfig {
  name: string;
  tagline: string;
  words: string[];
  countdownLabel: string;
  flyerEyebrow: string;
  flyerCloseLabel: string;
  navLinks: HeroNavigationLink[];
  ctas: HeroCtaButton[];
  backgrounds: HeroBackground[];
}

export interface EventConfig {
  name: string;
  start: string;
  end: string;
  flyer: string;
  description: string;
  headliners: string[];
  requiresTicket: boolean;
  tableHotline: string;
  ticketUrl?: string;
  calendarUrl?: string;
}

export interface EventPanelContent {
  eyebrow: string;
  headlinersLabel: string;
  entryLabel: string;
  entryCopyWhenRequired: string;
  entryCopyWhenComplimentary: string;
  calendarCtaLabel: string;
}

export interface ReservePanelContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string[];
  highlights: string[];
  emailCtaLabel: string;
  emailAddress: string;
  emailSubject: string;
  hotlineCtaLabel: string;
}

export interface TicketPanelContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  requiredCopy: string;
  complimentaryCopy: string;
  ctaLabel: string;
}

export interface ContactOption {
  value: string;
  label: string;
}

export interface ContactPanelContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  successMessage: string;
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  companyLabel: string;
  companyPlaceholder: string;
  enquiryLabel: string;
  options: ContactOption[];
  projectLabel: string;
  projectPlaceholder: string;
  submitLabel: string;
}

export interface AboutPanelContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  paragraphs: string[];
  hours: { label: string; value: string }[];
}

export interface LegalTabContent {
  id: string;
  label: string;
  paragraphs: string[];
}

export interface LegalPanelContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  tabs: LegalTabContent[];
}

export interface FooterSocialLink {
  name: string;
  url: string;
  icon?: 'instagram' | 'facebook' | 'tiktok' | 'x';
}

export interface FooterNavLink {
  label: string;
  action: { type: 'overlay'; target: Extract<OverlayView, 'about' | 'legal'> } | { type: 'route'; target: string };
}

export interface FooterConfig {
  socials: FooterSocialLink[];
  links: FooterNavLink[];
}

export interface RawSiteContent {
  hero: HeroContentConfig;
  event: EventConfig;
  panels: {
    event: EventPanelContent;
    reserve: ReservePanelContent;
    tickets: TicketPanelContent;
    contact: ContactPanelContent;
    about: AboutPanelContent;
    legal: LegalPanelContent;
  };
  footer: FooterConfig;
}

export interface SiteContent {
  hero: HeroContentConfig;
  event: Omit<EventConfig, 'start' | 'end'> & { start: Date; end: Date };
  panels: RawSiteContent['panels'];
  footer: FooterConfig;
}
