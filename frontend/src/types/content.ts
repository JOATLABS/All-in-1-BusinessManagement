export interface HeroBackground {
  src: string;
  alt: string;
  focalPoint?: { x: number; y: number };
}

export interface HeroContentConfig {
  name: string;
  tagline: string;
  words: string[];
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
}

export interface FooterLink {
  name: string;
  url: string;
  icon?: 'instagram' | 'facebook' | 'tiktok' | 'x';
}

export interface FooterConfig {
  socials: FooterLink[];
}

export interface RawSiteContent {
  hero: HeroContentConfig;
  event: EventConfig;
  footer: FooterConfig;
}

export interface SiteContent {
  hero: HeroContentConfig;
  event: Omit<EventConfig, 'start' | 'end'> & { start: Date; end: Date };
  footer: FooterConfig;
}
