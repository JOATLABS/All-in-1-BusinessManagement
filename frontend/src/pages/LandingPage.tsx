import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ContactPanel } from '../components/ContactPanel';
import { InfoPanel } from '../components/InfoPanel';
import { OverlayContextProvider, useOverlay } from '../components/OverlayContext';
import { UpcomingEventPanel } from '../components/UpcomingEventPanel';
import { defaultSiteContent } from '../config/defaultSiteContent';
import { useSiteContentContext } from '../content/SiteContentProvider';
import { fetchEvents, type Event } from '../services/eventsService';
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
  isReady: boolean;
}

const HeroContent = ({ hero, isReady }: HeroContentProps) => {
  const { openOverlay } = useOverlay();
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [now, setNow] = useState(new Date());
  const [isFlyerActive, setIsFlyerActive] = useState(false);
  const [featuredEvent, setFeaturedEvent] = useState<Event | null>(null);
  const [eventsLoading, setEventsLoading] = useState(true);

  const backgrounds = useMemo(() => {
    const activeBackgrounds = hero.backgrounds
      .filter((background) => (background.isActive ?? true) && background.src)
      .map((background) => ({
        ...background,
        mediaType: background.mediaType ?? 'image'
      }));

    return activeBackgrounds.length ? activeBackgrounds : defaultSiteContent.hero.backgrounds;
  }, [hero.backgrounds]);

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

  // Fetch featured event on mount
  useEffect(() => {
    let cancelled = false;

    const loadFeaturedEvent = async () => {
      try {
        const response = await fetchEvents();
        if (cancelled) {
          return;
        }

        // Find featured event or the next upcoming event
        const currentTime = new Date();
        const upcomingEvents = response.events
          .filter((e) => new Date(e.startsAt) > currentTime)
          .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

        const featured = upcomingEvents.find((e) => e.isFeatured) ?? upcomingEvents[0] ?? null;
        setFeaturedEvent(featured);
        setEventsLoading(false);
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load featured event:', error);
          setEventsLoading(false);
        }
      }
    };

    void loadFeaturedEvent();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setIsFlyerActive(false);
  }, [featuredEvent?.title, featuredEvent?.flyerUrl]);

  const countdown = useMemo(() => {
    if (!featuredEvent) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const diff = Math.max(new Date(featuredEvent.startsAt).getTime() - now.getTime(), 0);
    const seconds = Math.floor(diff / 1000);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return { days, hours, minutes, seconds: secs };
  }, [featuredEvent, now]);

  const eventWindow = useMemo(() => {
    if (!featuredEvent) {
      return '';
    }
    return formatEventRange(new Date(featuredEvent.startsAt), new Date(featuredEvent.endsAt));
  }, [featuredEvent]);

  const activeWord = heroWords.length ? heroWords[wordIndex] : '';
  const heroClassName = `hero${isFlyerActive ? ' hero--flyer-active' : ''}`;

  return (
    <section className={heroClassName} aria-labelledby="club-name" aria-busy={!isReady}>
      <div className="hero__media" aria-hidden="true">
        {backgrounds.map((background, index) => {
          const focalPoint = background.focalPoint
            ? `${background.focalPoint.x}% ${background.focalPoint.y}%`
            : '50% 50%';
          const isActiveLayer = index === backgroundIndex;
          const key = `${background.src}-${index}`;

          const layerProps = {
            key,
            className: 'hero__media-layer',
            initial: { opacity: 0 },
            animate: { opacity: isActiveLayer ? 1 : 0 },
            transition: { duration: 1.8, ease: 'easeInOut' },
            'aria-hidden': true,
            role: 'presentation' as const,
            'data-media-type': background.mediaType ?? 'image'
          } as const;

          if (background.mediaType === 'video') {
            return (
              <motion.div {...layerProps}>
                <video
                  className="hero__media-video"
                  src={background.src}
                  style={{ objectPosition: focalPoint }}
                  loop={background.loop ?? true}
                  muted={background.muted ?? true}
                  autoPlay={background.autoplay ?? true}
                  playsInline
                  preload="metadata"
                  poster={background.fallbackImage}
                />
              </motion.div>
            );
          }

          return (
            <motion.div
              {...layerProps}
              style={{
                backgroundImage: `url(${background.src})`,
                backgroundPosition: focalPoint,
                backgroundSize: 'cover'
              }}
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
          <Link to="/reserve" className="hero__nav-link">
            Reserve
          </Link>
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
          {hero.logoUrl && (
            <img
              src={hero.logoUrl}
              alt=""
              className="hero__logo hero__logo--left"
              aria-hidden="true"
              decoding="async"
            />
          )}
          <span className="hero__title-text">{hero.name}</span>
          {hero.logoUrl && (
            <img
              src={hero.logoUrl}
              alt=""
              className="hero__logo hero__logo--right"
              aria-hidden="true"
              decoding="async"
            />
          )}
        </h1>
        <p className="hero__subtitle">{hero.tagline}</p>
      </div>

      {!eventsLoading && featuredEvent && (
        <>
          <button
            className="hero__flyer-trigger hero__layer"
            onClick={() => setIsFlyerActive((value) => !value)}
            aria-expanded={isFlyerActive}
            aria-controls="hero-event-flyer"
            aria-label={isFlyerActive ? 'Hide upcoming event flyer' : 'Show upcoming event flyer'}
          >
            {featuredEvent.title}
          </button>

          <AnimatePresence>
            {isFlyerActive && featuredEvent.flyerUrl && (
              <motion.div
                id="hero-event-flyer"
                key={featuredEvent.title}
                className="hero__flyer-card hero__layer"
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
              >
                <div className="hero__flyer-media">
                  <img src={featuredEvent.flyerUrl} alt={`${featuredEvent.title} promotional flyer`} />
                </div>
                <div className="hero__flyer-meta">
                  <p className="hero__flyer-eyebrow">Upcoming Experience</p>
                  <h2 className="hero__flyer-title">{featuredEvent.title}</h2>
                  <p className="hero__flyer-time">{eventWindow}</p>
                  <p className="hero__flyer-copy">{featuredEvent.description || 'Join us for an unforgettable night.'}</p>
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
        </>
      )}

      <div className="hero__cta-row hero__layer" role="navigation" aria-label="Quick actions">
        <button className="hero__cta" onClick={() => openOverlay('events')}>
          Upcoming Event
        </button>
        <Link className="hero__cta" to="/reserve">
          Table Reservation
        </Link>
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
  overlays: SiteContent['overlays'];
}

const Panels = ({ overlays }: PanelsProps) => {
  const { closeOverlay, current } = useOverlay();
  const ticketsOverlay = overlays.tickets;
  const contactOverlay = overlays.contact;
  const aboutOverlay = overlays.about;
  const legalOverlay = overlays.legal;
  const [featuredEvent, setFeaturedEvent] = useState<Event | null>(null);

  // Fetch featured event for panels
  useEffect(() => {
    let cancelled = false;

    const loadFeaturedEvent = async () => {
      try {
        const response = await fetchEvents();
        if (cancelled) {
          return;
        }

        const currentTime = new Date();
        const upcomingEvents = response.events
          .filter((e) => new Date(e.startsAt) > currentTime)
          .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

        const featured = upcomingEvents.find((e) => e.isFeatured) ?? upcomingEvents[0] ?? null;
        setFeaturedEvent(featured);
      } catch (error) {
        console.error('Failed to load featured event for panels:', error);
      }
    };

    void loadFeaturedEvent();

    return () => {
      cancelled = true;
    };
  }, []);

  // Convert Event to EventContent for UpcomingEventPanel
  const eventContent = featuredEvent ? {
    name: featuredEvent.title,
    flyer: featuredEvent.flyerUrl || '',
    start: new Date(featuredEvent.startsAt),
    end: new Date(featuredEvent.endsAt),
    description: featuredEvent.description || '',
    requiresTicket: !featuredEvent.isFreeEntry,
    tableHotline: '+1 (555) 123-4567' // TODO: This should come from site content or event
  } : null;

  return (
    <AnimatePresence>
      {current === 'events' && eventContent && <UpcomingEventPanel key="events" event={eventContent} onClose={closeOverlay} />}
      {current === 'tickets' && (
        <InfoPanel
          key="tickets"
          onClose={closeOverlay}
          title={ticketsOverlay.title}
          subtitle={ticketsOverlay.subtitle}
        >
          {featuredEvent && !featuredEvent.isFreeEntry ? (
            <>
              <p>{ticketsOverlay.ticketCopy}</p>
              <a className="panel__cta" href={featuredEvent.ticketUrl || ticketsOverlay.ctaUrl} target="_blank" rel="noreferrer">
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
      <HeroContent hero={content.hero} isReady={isReady} />
      <Footer clubName={content.hero.name} socials={content.footer.socials} />
      <Panels overlays={content.overlays} />
    </div>
  </OverlayContextProvider>
);

export const LandingPage = () => {
  const { content, isReady } = useSiteContentContext();

  return <CustomerLanding content={content} isReady={isReady} />;
};
