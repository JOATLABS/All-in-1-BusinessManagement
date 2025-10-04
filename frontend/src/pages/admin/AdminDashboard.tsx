import { useMemo } from 'react';
import { useSiteContentContext } from '../../content/SiteContentProvider';

const rangeFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit'
});

const fallbackFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit'
});

const formatEventWindow = (start: Date, end: Date) => {
  const typedFormatter = rangeFormatter as Intl.DateTimeFormat & {
    formatRange?: (start: Date, end: Date) => string;
  };

  if (typeof typedFormatter.formatRange === 'function') {
    return typedFormatter.formatRange(start, end);
  }

  return `${rangeFormatter.format(start)} – ${fallbackFormatter.format(end)}`;
};

export const AdminDashboard = () => {
  const { content } = useSiteContentContext();
  const { event, hero, footer } = content;

  const countdown = useMemo(() => {
    const now = new Date();
    const diff = Math.max(event.start.getTime() - now.getTime(), 0);
    const seconds = Math.floor(diff / 1000);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    return { days, hours, minutes };
  }, [event.start]);

  const eventWindow = useMemo(() => formatEventWindow(event.start, event.end), [event.end, event.start]);
  const backgroundsActive = hero.backgrounds.length;
  const heroWords = hero.words.length;
  const socialLinks = footer.socials.length;

  return (
    <section>
      <header className="admin-dashboard__header">
        <p className="admin-dashboard__eyebrow">Operations overview</p>
        <h1>Nightlife control center</h1>
        <p className="admin-dashboard__intro">
          Monitor the upcoming headline event, gallery readiness, and customer-facing touchpoints before publishing updates to the
          landing experience.
        </p>
      </header>

      <div className="admin-dashboard__grid">
        <article className="admin-dashboard__card">
          <h2>Next experience</h2>
          <p className="admin-dashboard__metric">{event.name}</p>
          <p className="admin-dashboard__sub">{eventWindow}</p>
          <ul className="admin-dashboard__countdown">
            <li>
              <span className="admin-dashboard__count">{countdown.days.toString().padStart(2, '0')}</span>
              <span className="admin-dashboard__label">Days</span>
            </li>
            <li>
              <span className="admin-dashboard__count">{countdown.hours.toString().padStart(2, '0')}</span>
              <span className="admin-dashboard__label">Hours</span>
            </li>
            <li>
              <span className="admin-dashboard__count">{countdown.minutes.toString().padStart(2, '0')}</span>
              <span className="admin-dashboard__label">Minutes</span>
            </li>
          </ul>
          <p className="admin-dashboard__hint">
            {event.requiresTicket
              ? 'Ticketing is enabled. Confirm the ticket URL before publishing.'
              : 'Complimentary entry active. Update messaging if this changes.'}
          </p>
        </article>

        <article className="admin-dashboard__card">
          <h2>Hero readiness</h2>
          <p className="admin-dashboard__metric">{backgroundsActive}</p>
          <p className="admin-dashboard__sub">Looping backgrounds configured</p>
          <p className="admin-dashboard__hint">
            Maintain at least three assets for parallax depth. Verify focus points and reduced-motion fallbacks after edits.
          </p>
        </article>

        <article className="admin-dashboard__card">
          <h2>Customer touchpoints</h2>
          <p className="admin-dashboard__metric">{heroWords}</p>
          <p className="admin-dashboard__sub">Marquee statements cycling</p>
          <ul className="admin-dashboard__list">
            <li>
              <span>Footer links</span>
              <span className="admin-dashboard__muted">{socialLinks} socials live</span>
            </li>
            <li>
              <span>Overlay panels</span>
              <span className="admin-dashboard__muted">Events · Reserve · Tickets · Contact · Legal</span>
            </li>
          </ul>
        </article>
      </div>
    </section>
  );
};
