import type { SiteContent } from '../types/content';

export const defaultSiteContent: SiteContent = {
  hero: {
    name: 'OjaPlus Nightclub',
    tagline: 'Drink. Dine. Dance.',
    words: ['DRINK.', 'DINE.', 'DANCE.', 'REPEAT.'],
    backgrounds: [
      {
        src: 'https://images.unsplash.com/photo-1604079628040-94301bb21b11?auto=format&fit=crop&w=1600&q=80',
        alt: 'Crowd dancing under neon lights',
        focalPoint: { x: 50, y: 50 }
      }
    ]
  },
  event: {
    name: 'Velvet Pulse',
    flyer: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=80',
    start: new Date(),
    end: new Date(Date.now() + 3 * 60 * 60 * 1000),
    description:
      'Experience an Afrofuturist night with rotating DJs, immersive lighting, and curated cocktail rituals designed for storytellers.',
    requiresTicket: false,
    tableHotline: '+1 (332) 555-0199'
  },
  footer: {
    socials: [
      { name: 'Instagram', icon: 'instagram', url: 'https://instagram.com/ojaplus' }
    ]
  }
};
