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
  start: Date;
  end: Date;
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

export interface SiteContent {
  hero: HeroContent;
  event: EventContent;
  footer: FooterContent;
}
