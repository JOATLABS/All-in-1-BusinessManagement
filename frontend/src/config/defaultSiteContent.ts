import type { RawSiteContent } from '../types/content';

export const defaultSiteContent: RawSiteContent = {
  hero: {
    name: 'OJAPLUS NIGHTCLUB',
    tagline: 'Where Lagos energy meets New York precision.',
    words: ['DRINK', 'DANCE', 'INDULGE'],
    countdownLabel: 'Next experience begins in',
    flyerEyebrow: 'Upcoming Experience',
    flyerCloseLabel: 'Close Flyer',
    navLinks: [
      { id: 'about', label: 'About' },
      { id: 'events', label: 'Events' },
      { id: 'reserve', label: 'Reserve' },
      { id: 'contact', label: 'Contact' }
    ],
    ctas: [
      { id: 'events', label: 'Upcoming Event' },
      { id: 'reserve', label: 'Table Reservation' },
      { id: 'tickets', label: 'Ticket Pre-Sale' },
      { id: 'contact', label: 'Contact Us' }
    ],
    backgrounds: [
      {
        src: 'https://images.unsplash.com/photo-1542452255191-c85a98f2e6c9?auto=format&fit=crop&w=1600&q=80',
        alt: 'Crowd dancing under red lights'
      },
      {
        src: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=1600&q=80',
        alt: 'DJ performing with neon visuals'
      },
      {
        src: 'https://images.unsplash.com/photo-1546749876-2088f2e7f89b?auto=format&fit=crop&w=1600&q=80',
        alt: 'Luxurious lounge seating with moody lighting'
      }
    ]
  },
  event: {
    name: 'Velvet Pulse: Lunar Noir Edition',
    start: '2025-02-14T22:00:00-05:00',
    end: '2025-02-15T03:00:00-05:00',
    flyer: 'https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=1000&q=80',
    description:
      'An immersive Valentine’s showcase featuring house, Afrobeats, and signature sensory installations across two floors.',
    headliners: ['DJ Nyra', 'MC Kinetic', 'Visual Alchemist Collective'],
    requiresTicket: true,
    tableHotline: '+1 (646) 555-0199',
    ticketUrl: 'https://tickets.example.com/velvet-pulse',
    calendarUrl: 'https://calendar.google.com'
  },
  panels: {
    event: {
      eyebrow: 'Upcoming Event',
      headlinersLabel: 'Headliners',
      entryLabel: 'Entry',
      entryCopyWhenRequired: 'Pre-sale ticket required after 11 PM.',
      entryCopyWhenComplimentary: 'Complimentary entry all night.',
      calendarCtaLabel: 'Add to calendar'
    },
    reserve: {
      eyebrow: 'Experience',
      title: 'Reserve a Table',
      subtitle: 'Tailor the night for your crew',
      description: [
        'Lock in bottle service and bespoke lighting for your guests. Our concierge team responds within 30 minutes to craft the perfect arrival, seating, and celebration cues.'
      ],
      highlights: [
        'Private lounges for 6–12 guests with custom sound design',
        'Chef-curated share plates and premium champagne flights',
        'Dedicated host with priority entry and valet coordination'
      ],
      emailCtaLabel: 'Email concierge',
      emailAddress: 'host@ojaplusclub.com',
      emailSubject: 'Table Reservation Request',
      hotlineCtaLabel: 'Call concierge'
    },
    tickets: {
      eyebrow: 'Admissions',
      title: 'Ticket Pre-Sale',
      subtitle: 'Secure entry when events peak',
      requiredCopy:
        'This experience includes limited-capacity immersive elements. Pre-sale tickets guarantee express entry and access to our upstairs tasting lounge.',
      complimentaryCopy: 'Pre-sale tickets are not required for this event. Arrive early for complimentary entry until midnight.',
      ctaLabel: 'Purchase tickets'
    },
    contact: {
      eyebrow: 'Collaborate',
      title: 'Partner with OjaPlus',
      subtitle: 'For promoters, event architects, and brand activations',
      successMessage: 'Thank you. Our partnerships team will respond within one business day.',
      nameLabel: 'Full name',
      namePlaceholder: 'Adaeze Lawson',
      emailLabel: 'Email',
      emailPlaceholder: 'partners@agency.com',
      companyLabel: 'Company / Collective',
      companyPlaceholder: 'Pulse Syndicate',
      enquiryLabel: 'Enquiry type',
      options: [
        { value: 'promoter', label: 'Promoter collaboration' },
        { value: 'event-planner', label: 'Private experience buildout' },
        { value: 'partnership', label: 'Brand partnership' }
      ],
      projectLabel: 'Project vision',
      projectPlaceholder: 'Share your audience, preferred dates, and any special production requests.',
      submitLabel: 'Submit enquiry'
    },
    about: {
      eyebrow: 'Our Story',
      title: 'Born in Lagos, elevated in Manhattan',
      subtitle: 'Six sensory suites and a culinary program bridging continents',
      paragraphs: [
        'OjaPlus Nightclub resurrects the avant-garde spirit of the island’s nightlife with six sensory suites, immersive motion graphics, and a culinary program that bridges West African heat with global finesse.',
        'Every room features handcrafted timber, velvet seating, and lighting sequences designed to echo vintage cinema reels. Expect curated Afrofuturist playlists, surprise performances, and midnight rituals that amplify the dance floor.'
      ],
      hours: [
        { label: 'Thursday–Saturday', value: '9:00 PM – 4:00 AM' },
        { label: 'Sunday', value: '5:00 PM – 11:00 PM (Experiential supper club)' }
      ]
    },
    legal: {
      eyebrow: 'Compliance',
      title: 'Legal',
      subtitle: 'Terms & privacy',
      tabs: [
        {
          id: 'terms',
          label: 'Terms',
          paragraphs: [
            'Entry requires valid government-issued identification. We reserve the right to refuse admission to ensure a secure and inclusive environment for guests and staff.',
            'By entering, you consent to audio and video capture for promotional use. Table reservations are confirmed upon receipt of a signed service agreement and deposit. Ticket sales are final unless an event is cancelled.'
          ]
        },
        {
          id: 'privacy',
          label: 'Privacy',
          paragraphs: [
            'For privacy inquiries, contact privacy@ojaplusclub.com. A full privacy notice launches alongside the membership portal. We only retain guest data necessary to fulfil reservations or comply with legal obligations.'
          ]
        }
      ]
    }
  },
  footer: {
    socials: [
      { name: 'Instagram', url: 'https://instagram.com/ojaplus', icon: 'instagram' },
      { name: 'Facebook', url: 'https://facebook.com/ojaplus', icon: 'facebook' },
      { name: 'TikTok', url: 'https://tiktok.com/@ojaplus', icon: 'tiktok' }
    ],
    links: [
      { label: 'Operating Hours', action: { type: 'overlay', target: 'about' } },
      { label: 'Legal', action: { type: 'overlay', target: 'legal' } },
      { label: 'Admin', action: { type: 'route', target: '/admin' } }
    ]
  }
};
