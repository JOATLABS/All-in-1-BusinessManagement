import { test, expect, type Page, type BrowserContext, type Route } from '@playwright/test';

type SiteContentResponse = import('../frontend/src/services/contentService').SiteContentResponse;

const createIso = (offsetHours: number) => {
  const base = new Date('2025-10-18T21:00:00.000Z');
  base.setHours(base.getHours() + offsetHours);
  return base.toISOString();
};

const initialSiteContent: SiteContentResponse = {
  hero: {
    name: 'OjaPlus Nightclub',
    tagline: 'Drink. Dine. Dance.',
    words: ['DRINK.', 'DINE.', 'DANCE.', 'REPEAT.'],
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
    ],
    logoUrl: undefined
  },
  event: {
    name: 'Velvet Pulse',
    description:
      'Experience an Afrofuturist night with rotating DJs, immersive lighting, and curated cocktail rituals designed for storytellers.',
    flyer: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=80',
    start: createIso(0),
    end: createIso(3),
    requiresTicket: false,
    tableHotline: '+1 (332) 555-0199'
  },
  footer: {
    socials: [
      { name: 'Instagram', url: 'https://instagram.com/ojaplus', icon: 'instagram' },
      { name: 'TikTok', url: 'https://tiktok.com/@ojaplus', icon: 'tiktok' }
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
      }
    ]
  },
  overlays: {
    about: {
      title: 'Our Story',
      subtitle: 'Born in Lagos, elevated in Manhattan',
      paragraphs: [
        'OjaPlus Nightclub resurrects the avant-garde spirit of the island’s nightlife with six sensory suites.',
        'Expect curated Afrofuturist playlists, surprise performances, and midnight rituals that amplify the dance floor.'
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
        'This experience includes limited-capacity immersive elements. Pre-sale tickets guarantee express entry and access.',
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
        { value: 'promoter', label: 'Promoter partnership' }
      ],
      messagePlaceholder: 'Share event goals, audience size, or special requests',
      submitLabel: 'Send enquiry'
    },
    legal: {
      title: 'Legal',
      subtitle: 'Terms & privacy',
      terms: [
        'Entry requires valid identification. We reserve the right to refuse admission to protect guests and staff.',
        'Ticket sales are final unless an event is cancelled.'
      ],
      privacyPlaceholder: 'Privacy policy content will publish alongside the membership rollout.'
    }
  }
};

const reservationResponse = {
  reservations: [
    {
      id: 'res_123',
      tierId: 'intimate',
      tierLabel: 'Intimate Booth',
      tierPrice: '$50',
      tierCapacity: 'Seats up to 4',
      guestName: 'Ada Lovelace',
      email: 'ada@example.com',
      phone: null,
      guestCount: 4,
      paymentIntentId: null,
      status: 'confirmed',
      confirmationCode: 'VIP123',
      createdAt: '2025-10-10T18:00:00.000Z',
      updatedAt: '2025-10-10T18:00:00.000Z'
    }
  ]
};

const eventsResponse = {
  events: [
    {
      id: 'evt_123',
      title: 'Velvet Pulse',
      slug: 'velvet-pulse',
      description: 'Signature nightlife experience.',
      startsAt: createIso(24),
      endsAt: createIso(27),
      isFreeEntry: false,
      requiresRsvp: false,
      capacity: null,
      isFeatured: true,
      flyerUrl: 'https://images.unsplash.com/photo-1530023367847-a683933f4177?auto=format&fit=crop&w=1200&q=80',
      ticketUrl: 'https://tickets.example.com/velvet-pulse',
      createdAt: '2025-10-01T12:00:00.000Z',
      updatedAt: '2025-10-01T12:00:00.000Z'
    }
  ]
};

const registerApiMocks = async (context: BrowserContext) => {
  let currentContent: SiteContentResponse = structuredClone(initialSiteContent);

  await context.route('**/api/v1/auth/login', async (route) => {
    if (route.request().method() !== 'POST') {
      return route.fallback();
    }

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'test-token',
        user: { email: 'owner@example.com', role: 'superadmin' }
      })
    });
  });

  await context.route('**/api/v1/auth/logout', async (route) => {
    if (route.request().method() !== 'POST') {
      return route.fallback();
    }
    return route.fulfill({ status: 204, body: '' });
  });

  await context.route('**/api/v1/site-content', async (route) => {
    const method = route.request().method();

    if (method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(currentContent)
      });
    }

    if (method === 'PUT') {
      const payload = route.request().postData();
      if (payload) {
        currentContent = JSON.parse(payload) as SiteContentResponse;
      }
      return route.fulfill({ status: 204, body: '' });
    }

    return route.fallback();
  });

  const fulfillJson = (route: Route, data: unknown) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) });

  await context.route('**/api/v1/admin/reservations*', async (route) => {
    if (route.request().method() === 'GET') {
      return fulfillJson(route, reservationResponse);
    }
    return route.fallback();
  });

  await context.route('**/api/v1/events*', async (route) => {
    if (route.request().method() === 'GET') {
      return fulfillJson(route, eventsResponse);
    }
    return route.fallback();
  });
};

const loginAsOwner = async (page: Page) => {
  await page.goto('/admin/login');
  await page.fill('input[name="email"]', 'owner@example.com');
  await page.fill('input[name="password"]', 'supersecure');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin');
};

test.describe('Workflow validation smoke tests', () => {
  test.beforeEach(async ({ page }) => {
    await registerApiMocks(page.context());
  });

  test('superadmin updates hero copy and sees changes on public site', async ({ page }) => {
    await loginAsOwner(page);

    await page.getByRole('link', { name: 'Site Configuration' }).click();
    await page.waitForURL('**/admin/site-configuration');

    const heroNameInput = page.getByLabel('Club name', { exact: true });
    const heroTaglineInput = page.getByLabel('Tagline');
    const marqueeInput = page.getByLabel('Marquee words');

    const nextName = 'OjaPlus Prime';
    const nextTagline = 'Elevate the after-dark ritual.';
    const nextMarquee = 'ELEVATE.\nCELEBRATE.\nRESIDE.';

    await heroNameInput.fill(nextName);
    await heroTaglineInput.fill(nextTagline);
    await marqueeInput.fill(nextMarquee);

    await expect(page.getByRole('button', { name: 'Save changes' })).toBeEnabled();
    await page.getByRole('button', { name: 'Save changes' }).click();

    await expect(page.getByRole('status')).toContainText('Changes saved');

    const publicPage = await page.context().newPage();
    await publicPage.goto('/');

    await expect(publicPage.locator('#club-name')).toContainText(nextName);
    await expect(publicPage.getByText(nextTagline).first()).toBeVisible();
    await expect(publicPage.locator('.hero__marquee-word').first()).toHaveText('ELEVATE.');
  });
});
