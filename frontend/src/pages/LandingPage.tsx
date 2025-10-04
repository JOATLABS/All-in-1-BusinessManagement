import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ContactPanel } from '../components/ContactPanel';
import { InfoPanel } from '../components/InfoPanel';
import { OverlayContextProvider, useOverlay } from '../components/OverlayContext';
import { UpcomingEventPanel } from '../components/UpcomingEventPanel';
import { defaultSiteContent } from '../config/defaultSiteContent';
import { useSiteContentContext } from '../content/SiteContentProvider';
import type { SiteContent } from '../types/content';

const primaryRangeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  weekday: 'short',
  month: 'short',
  day: 'numeric'
});

const fallbackRangeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit'
});

const formatEventRange = (start: Date, end: Date) => {
  const formatterWithRange = primaryRangeFormatter as Intl.DateTimeFormat & {
    formatRange?: (start: Date, end: Date) => string;
  };

  if (typeof formatterWithRange.formatRange === 'function') {
    return formatterWithRange.formatRange(start, end);
  }

  return `${primaryRangeFormatter.format(start)} – ${fallbackRangeFormatter.format(end)}`;
};

interface HeroContentProps {
  hero: SiteContent['hero'];
  event: SiteContent['event'];
  isReady: boolean;
}

const HeroContent = ({ hero, event, isReady }: HeroContentProps) => {
  const { openOverlay } = useOverlay();
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [now, setNow] = useState(new Date());
  const [isFlyerActive, setIsFlyerActive] = useState(false);

  const backgrounds = useMemo(
    () => (hero.backgrounds.length ? hero.backgrounds : defaultSiteContent.hero.backgrounds),
    [hero.backgrounds]
  );

  const heroWords = useMemo(
    () => (hero.words.length ? hero.words : defaultSiteContent.hero.words),
    [hero.words]
  );

  useEffect(() => {
    setBackgroundIndex((index) => (index >= backgrounds.length ? 0 : index));
    if (backgrounds.length <= 1) {
      return;
    }

    const backgroundInterval = setInterval(() => {
      setBackgroundIndex((index) => (index + 1) % backgrounds.length);
    }, 7000);

    return () => {
      clearInterval(backgroundInterval);
    };
  }, [backgrounds]);

  useEffect(() => {
    setWordIndex((index) => (index >= heroWords.length ? 0 : index));
    if (heroWords.length <= 1) {
      return;
    }

    const wordInterval = setInterval(() => {
      setWordIndex((index) => (index + 1) % heroWords.length);
    }, 2500);

    return () => {
      clearInterval(wordInterval);
    };
  }, [heroWords]);

  useEffect(() => {
    const clockInterval = setInterval(() => setNow(new Date()), 1000);

    return () => {
      clearInterval(clockInterval);
    };
  }, []);

  useEffect(() => {
    setIsFlyerActive(false);
  }, [event.name, event.flyer]);

  const countdown = useMemo(() => {
    const diff = Math.max(event.start.getTime() - now.getTime(), 0);
    const seconds = Math.floor(diff / 1000);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return { days, hours, minutes, seconds: secs };
  }, [event.start, now]);

  const eventWindow = useMemo(() => formatEventRange(event.start, event.end), [event.end, event.start]);
  const activeWord = heroWords.length ? heroWords[wordIndex] : '';
  const heroClassName = `hero${isFlyerActive ? ' hero--flyer-active' : ''}`;

  return (
    <section className={heroClassName} aria-labelledby="club-name" aria-busy={!isReady}>
      <div className="hero__media" aria-hidden="true">
        {backgrounds.map((background, index) => {
          const backgroundPosition = background.focalPoint
            ? `${background.focalPoint.x}% ${background.focalPoint.y}%`
            : 'center';

          return (
            <motion.div
              key={background.src}
              className="hero__media-layer"
              initial={{ opacity: 0 }}
              animate={{ opacity: index === backgroundIndex ? 1 : 0 }}
              transition={{ duration: 1.8, ease: 'easeInOut' }}
              style={{ backgroundImage: `url(${background.src})`, backgroundPosition }}
              role="presentation"
            />
          );
        })}
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

      <div className="hero__marquee hero__layer">
        {activeWord && (
          <motion.span
            key={activeWord}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.9, ease: 'easeInOut' }}
            className="hero__marquee-word"
          >
            {activeWord}
          </motion.span>
        )}
      </div>

      <div className="hero__title-wrap hero__layer">
        <h1 id="club-name" className="hero__title">
          {hero.name}
        </h1>
        <p className="hero__subtitle">{hero.tagline}</p>
      </div>

      <button
        className="hero__flyer-trigger hero__layer"
        onClick={() => setIsFlyerActive((value) => !value)}
        aria-expanded={isFlyerActive}
        aria-controls="hero-event-flyer"
        aria-label={isFlyerActive ? 'Hide upcoming event flyer' : 'Show upcoming event flyer'}
      >
        {event.name}
      </button>

      <AnimatePresence>
        {isFlyerActive && (
          <motion.div
            id="hero-event-flyer"
            key={event.name}
            className="hero__flyer-card hero__layer"
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            <div className="hero__flyer-media">
              <img src={event.flyer} alt={`${event.name} promotional flyer`} />
            </div>
            <div className="hero__flyer-meta">
              <p className="hero__flyer-eyebrow">Upcoming Experience</p>
              <h2 className="hero__flyer-title">{event.name}</h2>
              <p className="hero__flyer-time">{eventWindow}</p>
              <p className="hero__flyer-copy">{event.description}</p>
              <button type="button" className="hero__flyer-close" onClick={() => setIsFlyerActive(false)}>
                Close Flyer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="hero__countdown hero__layer" role="timer" aria-live="polite">
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

      <div className="hero__cta-row hero__layer" role="navigation" aria-label="Quick actions">
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

interface FooterProps {
  clubName: string;
  socials: SiteContent['footer']['socials'];
}

const iconPath = {
  instagram: 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.5 5.5 0 0 1 12 7.5zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5zm5.75-3.75a1.25 1.25 0 1 1-1.25 1.25 1.25 1.25 0 0 1 1.25-1.25z',
  facebook: 'M13.5 9H16l.5-3h-3V4.5C13.5 3.672 14.172 3 15 3h1.5V0H15a4.5 4.5 0 0 0-4.5 4.5V6H7.5v3H10v12h3.5z',
  tiktok: 'M21 8.5a6.5 6.5 0 0 1-4.5-1.8V16a5 5 0 1 1-5-5c.24 0 .47.02.7.05V8.04c-4.05-.4-7.2 2.92-7.2 6.96A7 7 0 0 0 17 20V8.5c1.13.85 2.53 1.35 4 1.35z',
  x: 'M2 3l8.18 9.73L2.3 21h2.28l6.06-6.9L15.62 21H22l-8.42-9.82L21.46 3h-2.28l-5.56 6.34L8.38 3z'
} as const;

const Footer = ({ clubName, socials }: FooterProps) => {
  const { openOverlay } = useOverlay();
  return (
    <footer className="footer">
      <button className="footer__brand" onClick={() => openOverlay('about')}>
        {clubName}
      </button>
      <div className="footer__links">
        <button className="footer__link" onClick={() => openOverlay('about')}>
          Operating Hours
        </button>
        <button className="footer__link" onClick={() => openOverlay('legal')}>
          Legal
        </button>
        <button className="footer__link" onClick={() => openOverlay('contact')}>
          Contact
        </button>
        <Link className="footer__link footer__link--anchor" to="/admin/login">
          Admin
        </Link>
      </div>
      <div className="footer__social" aria-label="Social media">
        {socials.map((social) => {
          const path = social.icon ? iconPath[social.icon] : iconPath.instagram;
          return (
            <a key={social.name} className="footer__icon" href={social.url} aria-label={social.name}>
              <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                <path d={path} />
              </svg>
            </a>
          );
        })}
      </div>
    </footer>
  );
};

interface PanelsProps {
  event: SiteContent['event'];
  overlays: SiteContent['overlays'];
}

const Panels = ({ event, overlays }: PanelsProps) => {
  const { closeOverlay, current } = useOverlay();
  const hotlineHref = `tel:${event.tableHotline.replace(/[^+\d]/g, '')}`;
  const reserveOverlay = overlays.reserve;
  const ticketsOverlay = overlays.tickets;
  const contactOverlay = overlays.contact;
  const aboutOverlay = overlays.about;
  const legalOverlay = overlays.legal;
  const hotlineLabel = reserveOverlay.hotlineLabel.replace('{hotline}', event.tableHotline);

  return (
    <AnimatePresence>
      {current === 'events' && <UpcomingEventPanel key="events" event={event} onClose={closeOverlay} />}
      {current === 'reserve' && (
        <InfoPanel
          key="reserve"
          onClose={closeOverlay}
          title={reserveOverlay.title}
          subtitle={reserveOverlay.subtitle}
        >
          <p>{reserveOverlay.intro}</p>
          <ul>
            {reserveOverlay.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
          <a className="panel__cta" href={reserveOverlay.emailCta.href}>
            {reserveOverlay.emailCta.label}
          </a>
          <a className="panel__cta" href={hotlineHref}>
            {hotlineLabel}
          </a>
        </InfoPanel>
      )}
      {current === 'tickets' && (
        <InfoPanel
          key="tickets"
          onClose={closeOverlay}
          title={ticketsOverlay.title}
          subtitle={ticketsOverlay.subtitle}
        >
          {event.requiresTicket ? (
            <>
              <p>{ticketsOverlay.ticketCopy}</p>
              <a className="panel__cta" href={ticketsOverlay.ctaUrl} target="_blank" rel="noreferrer">
                {ticketsOverlay.ctaLabel}
              </a>
            </>
          ) : (
            <p>{ticketsOverlay.fallbackCopy}</p>
          )}
        </InfoPanel>
      )}
      {current === 'contact' && <ContactPanel key="contact" onClose={closeOverlay} content={contactOverlay} />}
      {current === 'about' && (
        <InfoPanel key="about" onClose={closeOverlay} title={aboutOverlay.title} subtitle={aboutOverlay.subtitle}>
          {aboutOverlay.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <section className="panel__section">
            <h3>Operating Hours</h3>
            {aboutOverlay.hours.map((hour) => (
              <p key={hour.label}>
                {hour.label}: {hour.value}
              </p>
            ))}
          </section>
        </InfoPanel>
      )}
      {current === 'legal' && (
        <InfoPanel key="legal" onClose={closeOverlay} title={legalOverlay.title} subtitle={legalOverlay.subtitle}>
          <div className="panel__tabs" role="tablist" aria-label="Legal sections">
            <button className="panel__tab panel__tab--active" type="button">
              Terms
            </button>
            <button className="panel__tab" type="button" disabled>
              Privacy
            </button>
          </div>
          <div className="panel__scroll">
            {legalOverlay.terms.map((term, index) => (
              <p key={`legal-term-${index}`}>{term}</p>
            ))}
            <p>{legalOverlay.privacyPlaceholder}</p>
          </div>
        </InfoPanel>
      )}
    </AnimatePresence>
  );
};

interface CustomerLandingProps {
  content: SiteContent;
  isReady: boolean;
}

const CustomerLanding = ({ content, isReady }: CustomerLandingProps) => (
  <OverlayContextProvider>
    <div className="app">
      <HeroContent hero={content.hero} event={content.event} isReady={isReady} />
      <Footer clubName={content.hero.name} socials={content.footer.socials} />
      <Panels event={content.event} overlays={content.overlays} />
    </div>
  </OverlayContextProvider>
);

export const LandingPage = () => {
  const { content, isReady } = useSiteContentContext();

  return <CustomerLanding content={content} isReady={isReady} />;
};
