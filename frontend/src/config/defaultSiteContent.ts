import type { SiteContent } from '../types/content';

export const defaultSiteContent: SiteContent = {
  hero: {
    name: 'OjaPlus Nightclub',
    tagline: 'Drink. Dine. Dance.',
    words: ['DRINK.', 'DINE.', 'DANCE.', 'REPEAT.'],
    logoUrl: undefined,
    logo: undefined,
    backgrounds: [
      {
        src: 'https://images.unsplash.com/photo-1604079628040-94301bb21b11?auto=format&fit=crop&w=1600&q=80',
        alt: 'Crowd dancing under neon lights',
        focalPoint: { x: 50, y: 50 },
        mediaType: 'image',
        isActive: true,
        playbackDepth: 'medium',
        order: 0
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
  reservation: {
    title: 'Reserve Your VIP Section',
    subtitle: 'Book instantly',
    heroEyebrow: 'VIP reservations',
    backLinkLabel: '← Back to experiences',
    intro:
      'Grab your booth online and walk straight in. Concierge entry and bottle service are ready when you arrive.',
    availabilityNote:
      'Numbers update live—finish payment and the section is yours.',
    availability: {
      heading: "Tonight's availability",
      liveTag: 'Live update',
      loadingLabel: 'Syncing…',
      openLabel: 'Open sections',
      reservedLabel: 'Already booked',
      totalLabel: 'Total inventory'
    },
    carousel: {
      heading: 'Pick your section',
      previousLabel: 'View previous section',
      nextLabel: 'View next section',
      availableLabel: 'Available',
      reserveButtonLabel: 'Reserve for {price}',
      soldOutLabel: 'Sold out'
    },
    modal: {
      stepsHeading: 'How it works',
      detailsHeading: 'Crew details',
      paymentHeading: 'Secure payment',
      confirmationCodeLabel: 'Confirmation code',
      detailsCtaLabel: 'Continue to payment',
      paymentCtaLabel: 'Pay {price}',
      paymentProcessingLabel: 'Processing…',
      confirmationCtaLabel: 'Done'
    },
    paymentSteps: ['Guest info', 'Payment', 'QR pass'],
    confirmationHeadline: 'You’re confirmed.',
    confirmationSubtext:
      'Your QR pass is in your inbox. Show it with your ID when you arrive.',
    tableTiers: [
      {
        id: 'intimate',
        label: 'Intimate Booth',
        capacity: 'Seats up to 4',
        description: 'Private lounge nook for tight crews and early hangs.',
        price: '$50',
        total: 6,
        reserved: 2,
        visual: {
          pattern: 'grid',
          primaryColor: '#9333ea',
          secondaryColor: '#f472b6',
          accentColor: '#ffffff1a'
        }
      },
      {
        id: 'social',
        label: 'Social Nook',
        capacity: 'Seats 6–7',
        description: 'Corner energy beside the floor with room to move.',
        price: '$90',
        total: 7,
        reserved: 3,
        visual: {
          pattern: 'halo',
          primaryColor: '#22d3ee',
          secondaryColor: '#6366f1',
          accentColor: '#ffffff14'
        }
      },
      {
        id: 'grand',
        label: 'Grand Suite',
        capacity: 'Hosts 8–10',
        description: 'Raised suite with bottle lockers and DJ views.',
        price: '$150',
        total: 5,
        reserved: 1,
        visual: {
          pattern: 'pillars',
          primaryColor: '#f97316',
          secondaryColor: '#facc15',
          accentColor: '#ffffff12'
        }
      }
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
        'By entering, you consent to audio and video capture for promotional use. Table reservations are confirmed once full payment is received. Ticket sales are final unless an event is cancelled.',
        'For privacy inquiries, contact privacy@ojaplusclub.com. Full privacy notice launches with the membership portal.'
      ],
      privacyPlaceholder: 'Privacy policy content will publish alongside the membership rollout.'
    }
  }
};
