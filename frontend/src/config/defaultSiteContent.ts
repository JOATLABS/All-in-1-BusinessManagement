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
  },
  overlays: {
    about: {
      title: 'Our Story',
      subtitle: 'Born in Lagos, elevated in Manhattan',
      paragraphs: [
        'OjaPlus Nightclub resurrects the avant-garde spirit of the island’s nightlife with six sensory suites, immersive motion graphics, and a culinary program that bridges West African heat with global finesse.',
        'Every room features handcrafted timber, velvet seating, and lighting sequences designed to echo vintage cinema reels. Expect curated Afrofuturist playlists, surprise performances, and midnight rituals that amplify the dance floor.'
      ],
      hours: [
        { label: 'Thursday–Saturday', value: '9:00 PM – 4:00 AM' },
        { label: 'Sunday', value: '5:00 PM – 11:00 PM (Experiential supper club)' }
      ]
    },
    reserve: {
      title: 'Reserve a Table',
      subtitle: 'Tailor the night for your crew',
      intro:
        'Lock in bottle service and bespoke lighting for your guests. Our concierge team responds within 30 minutes to craft the perfect arrival, seating, and celebration cues.',
      bullets: [
        'Private lounges for 6–12 guests with custom sound design',
        'Chef-curated share plates and premium champagne flights',
        'Dedicated host with priority entry and valet coordination'
      ],
      emailCta: { label: 'Email concierge', href: 'mailto:host@ojaplusclub.com?subject=Table%20Reservation%20Request' },
      hotlineLabel: 'Call {hotline}'
    },
    tickets: {
      title: 'Ticket Pre-Sale',
      subtitle: 'Secure entry when events peak',
      ticketCopy:
        'This experience includes limited-capacity immersive elements. Pre-sale tickets guarantee express entry and access to our upstairs tasting lounge.',
      fallbackCopy: 'Pre-sale tickets are not required for this event. Arrive early for complimentary entry until midnight.',
      ctaLabel: 'Purchase tickets',
      ctaUrl: 'https://tickets.example.com/velvet-pulse'
    },
    contact: {
      eyebrow: 'Partner with us',
      title: 'Contact Us',
      subtitle: 'Promoters, planners & collaborators',
      topics: [
        { value: 'private-hire', label: 'Private hire' },
        { value: 'promoter', label: 'Promoter partnership' },
        { value: 'production', label: 'Production & AV' },
        { value: 'other', label: 'General enquiry' }
      ],
      messagePlaceholder: 'Share event goals, audience size, or special requests',
      submitLabel: 'Send enquiry'
    },
    legal: {
      title: 'Legal',
      subtitle: 'Terms & privacy',
      terms: [
        'Entry requires valid government-issued identification. We reserve the right to refuse admission to ensure a secure and inclusive environment for guests and staff.',
        'By entering, you consent to audio and video capture for promotional use. Table reservations are confirmed upon receipt of a signed service agreement and deposit. Ticket sales are final unless an event is cancelled.',
        'For privacy inquiries, contact privacy@ojaplusclub.com. Full privacy notice launches with the membership portal.'
      ],
      privacyPlaceholder: 'Privacy policy content will publish alongside the membership rollout.'
    }
  }
};
