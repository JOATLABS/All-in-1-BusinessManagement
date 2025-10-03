import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ContactPanel } from './components/ContactPanel';
import { InfoPanel } from './components/InfoPanel';
import { OverlayContextProvider, useOverlay } from './components/OverlayContext';
import { UpcomingEventPanel } from './components/UpcomingEventPanel';

const heroBackgrounds = [
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
];

const eventConfig = {
  name: 'Velvet Pulse: Lunar Noir Edition',
  start: new Date('2025-02-14T22:00:00'),
  end: new Date('2025-02-15T03:00:00'),
  flyer:
    'https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=1000&q=80',
  description:
    'An immersive Valentine’s showcase featuring house, Afrobeats, and signature sensory installations across two floors.',
  headliners: ['DJ Nyra', 'MC Kinetic', 'Visual Alchemist Collective'],
  requiresTicket: true,
  tableHotline: '+1 (646) 555-0199'
};

const heroWords = ['DRINK', 'DANCE', 'INDULGE'];

const HeroContent = () => {
  const { openOverlay } = useOverlay();
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const backgroundInterval = setInterval(
      () => setBackgroundIndex((index) => (index + 1) % heroBackgrounds.length),
      7000
    );

    const wordInterval = setInterval(
      () => setWordIndex((index) => (index + 1) % heroWords.length),
      2500
    );

    const clockInterval = setInterval(() => setNow(new Date()), 1000);

    return () => {
      clearInterval(backgroundInterval);
      clearInterval(wordInterval);
      clearInterval(clockInterval);
    };
  }, []);

  const countdown = useMemo(() => {
    const diff = Math.max(eventConfig.start.getTime() - now.getTime(), 0);
    const seconds = Math.floor(diff / 1000);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return { days, hours, minutes, seconds: secs };
  }, [now]);

  return (
    <section className="hero" aria-labelledby="club-name">
      <div className="hero__media" aria-hidden="true">
        {heroBackgrounds.map((background, index) => (
          <motion.div
            key={background.src}
            className="hero__media-layer"
            initial={{ opacity: 0 }}
            animate={{ opacity: index === backgroundIndex ? 1 : 0 }}
            transition={{ duration: 1.8, ease: 'easeInOut' }}
            style={{ backgroundImage: `url(${background.src})` }}
            role="presentation"
          />
        ))}
        <div className="hero__grain" />
      </div>

      <header className="hero__header">
        <nav className="hero__nav" aria-label="Primary">
          <button onClick={() => openOverlay('about')} className="hero__nav-link">
            About
          </button>
          <button onClick={() => openOverlay('events')} className="hero__nav-link">
            Events
          </button>
          <button onClick={() => openOverlay('reserve')} className="hero__nav-link">
            Reserve
          </button>
          <button onClick={() => openOverlay('contact')} className="hero__nav-link">
            Contact
          </button>
        </nav>
      </header>

      <div className="hero__marquee">
        <motion.span
          key={heroWords[wordIndex]}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
          className="hero__marquee-word"
        >
          {heroWords[wordIndex]}
        </motion.span>
        <div className="hero__title-wrap">
          <h1 id="club-name" className="hero__title">
            OJAPLUS NIGHTCLUB
          </h1>
          <p className="hero__subtitle">Where Lagos energy meets New York precision.</p>
        </div>
      </div>

      <button className="hero__flyer-trigger" onClick={() => openOverlay('events')}>
        Next Event Flyer
      </button>

      <div className="hero__countdown" role="timer" aria-live="polite">
        <div className="hero__countdown-label">Next event begins in</div>
        <div className="hero__countdown-grid">
          {(['days', 'hours', 'minutes', 'seconds'] as const).map((unit) => (
            <div key={unit} className="hero__countdown-cell">
              <span className="hero__countdown-value">{countdown[unit].toString().padStart(2, '0')}</span>
              <span className="hero__countdown-unit">{unit}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="hero__cta-row" role="navigation" aria-label="Quick actions">
        <button className="hero__cta" onClick={() => openOverlay('events')}>
          Upcoming Event
        </button>
        <button className="hero__cta" onClick={() => openOverlay('reserve')}>
          Table Reservation
        </button>
        <button className="hero__cta" onClick={() => openOverlay('tickets')}>
          Ticket Pre-Sale
        </button>
        <button className="hero__cta" onClick={() => openOverlay('contact')}>
          Contact Us
        </button>
      </div>
    </section>
  );
};

const Footer = () => {
  const { openOverlay } = useOverlay();
  return (
    <footer className="footer">
      <div className="footer__primary">
        <button className="footer__brand" onClick={() => openOverlay('about')}>
          OJAPLUS
        </button>
        <div className="footer__links">
          <button className="footer__link" onClick={() => openOverlay('about')}>
            Operating Hours
          </button>
          <button className="footer__link" onClick={() => openOverlay('legal')}>
            Legal
          </button>
        </div>
      </div>
      <div className="footer__secondary" aria-label="Social media">
        <a className="footer__icon" href="https://instagram.com" aria-label="Instagram">
          <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
            <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.5 5.5 0 0 1 12 7.5zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5zm5.75-3.75a1.25 1.25 0 1 1-1.25 1.25 1.25 1.25 0 0 1 1.25-1.25z" />
          </svg>
        </a>
        <a className="footer__icon" href="https://facebook.com" aria-label="Facebook">
          <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
            <path d="M13.5 9H16l.5-3h-3V4.5C13.5 3.672 14.172 3 15 3h1.5V0H15a4.5 4.5 0 0 0-4.5 4.5V6H7.5v3H10v12h3.5z" />
          </svg>
        </a>
        <a className="footer__icon" href="https://tiktok.com" aria-label="TikTok">
          <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
            <path d="M21 8.5a6.5 6.5 0 0 1-4.5-1.8V16a5 5 0 1 1-5-5c.24 0 .47.02.7.05V8.04c-4.05-.4-7.2 2.92-7.2 6.96A7 7 0 0 0 17 20V8.5c1.13.85 2.53 1.35 4 1.35z" />
          </svg>
        </a>
      </div>
    </footer>
  );
};

const Panels = () => {
  const { closeOverlay, current } = useOverlay();

  return (
    <AnimatePresence>
      {current === 'events' && (
        <UpcomingEventPanel
          key="events"
          event={eventConfig}
          onClose={closeOverlay}
        />
      )}
      {current === 'reserve' && (
        <InfoPanel
          key="reserve"
          onClose={closeOverlay}
          title="Reserve a Table"
          subtitle="Tailor the night for your crew"
        >
          <p>
            Lock in bottle service and bespoke lighting for your guests. Our concierge team responds within 30 minutes to craft
            the perfect arrival, seating, and celebration cues.
          </p>
          <ul>
            <li>Private lounges for 6–12 guests with custom sound design</li>
            <li>Chef-curated share plates and premium champagne flights</li>
            <li>Dedicated host with priority entry and valet coordination</li>
          </ul>
          <a className="panel__cta" href="mailto:host@ojaplusclub.com?subject=Table%20Reservation%20Request">
            Email concierge
          </a>
          <a className="panel__cta" href={`tel:${eventConfig.tableHotline.replace(/[^+\d]/g, '')}`}>
            Call {eventConfig.tableHotline}
          </a>
        </InfoPanel>
      )}
      {current === 'tickets' && (
        <InfoPanel
          key="tickets"
          onClose={closeOverlay}
          title="Ticket Pre-Sale"
          subtitle="Secure entry when events peak"
        >
          {eventConfig.requiresTicket ? (
            <>
              <p>
                This experience includes limited-capacity immersive elements. Pre-sale tickets guarantee express entry and access to our
                upstairs tasting lounge.
              </p>
              <a className="panel__cta" href="https://tickets.example.com/velvet-pulse" target="_blank" rel="noreferrer">
                Purchase tickets
              </a>
            </>
          ) : (
            <p>Pre-sale tickets are not required for this event. Arrive early for complimentary entry until midnight.</p>
          )}
        </InfoPanel>
      )}
      {current === 'contact' && <ContactPanel key="contact" onClose={closeOverlay} />}
      {current === 'about' && (
        <InfoPanel
          key="about"
          onClose={closeOverlay}
          title="Our Story"
          subtitle="Born in Lagos, elevated in Manhattan"
        >
          <p>
            OjaPlus Nightclub resurrects the avant-garde spirit of the island’s nightlife with six sensory suites, immersive motion
            graphics, and a culinary program that bridges West African heat with global finesse.
          </p>
          <p>
            Every room features handcrafted timber, velvet seating, and lighting sequences designed to echo vintage cinema reels.
            Expect curated Afrofuturist playlists, surprise performances, and midnight rituals that amplify the dance floor.
          </p>
          <section className="panel__section">
            <h3>Operating Hours</h3>
            <p>Thursday–Saturday: 9:00 PM – 4:00 AM</p>
            <p>Sunday: 5:00 PM – 11:00 PM (Experiential supper club)</p>
          </section>
        </InfoPanel>
      )}
      {current === 'legal' && (
        <InfoPanel key="legal" onClose={closeOverlay} title="Legal" subtitle="Terms & privacy">
          <div className="panel__tabs" role="tablist" aria-label="Legal sections">
            <button className="panel__tab panel__tab--active" type="button">
              Terms
            </button>
            <button className="panel__tab" type="button" disabled>
              Privacy
            </button>
          </div>
          <div className="panel__scroll">
            <p>
              Entry requires valid government-issued identification. We reserve the right to refuse admission to ensure a secure and
              inclusive environment for guests and staff.
            </p>
            <p>
              By entering, you consent to audio and video capture for promotional use. Table reservations are confirmed upon receipt of
              a signed service agreement and deposit. Ticket sales are final unless an event is cancelled.
            </p>
            <p>
              For privacy inquiries, contact privacy@ojaplusclub.com. Full privacy notice launches with the membership portal.
            </p>
          </div>
        </InfoPanel>
      )}
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <OverlayContextProvider>
      <div className="app">
        <HeroContent />
        <Footer />
        <Panels />
      </div>
    </OverlayContextProvider>
  );
};

export default App;
