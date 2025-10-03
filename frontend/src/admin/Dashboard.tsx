import { useMemo } from 'react';
import type { HeroBackground, SiteContent } from '../types/content';

interface AdminDashboardProps {
  event: SiteContent['event'];
  heroBackgrounds: HeroBackground[];
  footerLinks: SiteContent['footer']['socials'];
}

const formatCountdown = (event: SiteContent['event']) => {
  const now = new Date();
  const diff = Math.max(event.start.getTime() - now.getTime(), 0);
  const totalMinutes = Math.floor(diff / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  return { days, hours, minutes };
};

export const AdminDashboard = ({ event, heroBackgrounds, footerLinks }: AdminDashboardProps) => {
  const countdown = useMemo(() => formatCountdown(event), [event]);

  return (
    <section className="admin-dashboard" aria-labelledby="admin-dashboard-title">
      <header className="admin-dashboard__header">
        <div>
          <p className="admin-dashboard__eyebrow">Control centre</p>
          <h1 id="admin-dashboard-title">Tonight&apos;s operations</h1>
          <p className="admin-dashboard__intro">
            Review critical stats before doors open. Optimise hero backgrounds, confirm the featured event, and keep partners in
            sync.
          </p>
        </div>
      </header>
      <div className="admin-dashboard__grid">
        <article className="admin-dashboard__card">
          <h2>Featured event</h2>
          <p className="admin-dashboard__metric">{event.name}</p>
          <p className="admin-dashboard__sub">Starts {event.start.toLocaleString()}</p>
          <ul className="admin-dashboard__countdown" aria-label="Countdown to featured event">
            <li>
              <span className="admin-dashboard__count">{countdown.days}</span>
              <span className="admin-dashboard__label">Days</span>
            </li>
            <li>
              <span className="admin-dashboard__count">{countdown.hours}</span>
              <span className="admin-dashboard__label">Hours</span>
            </li>
            <li>
              <span className="admin-dashboard__count">{countdown.minutes}</span>
              <span className="admin-dashboard__label">Minutes</span>
            </li>
          </ul>
          <p className="admin-dashboard__hint">Update schedule and ticketing in the events module.</p>
        </article>
        <article className="admin-dashboard__card">
          <h2>Hero backgrounds</h2>
          <p className="admin-dashboard__metric">{heroBackgrounds.length}</p>
          <p className="admin-dashboard__sub">active loops</p>
          <ol className="admin-dashboard__list" aria-label="Current background order">
            {heroBackgrounds.map((background, index) => (
              <li key={background.src}>
                <span>{index + 1}.</span>
                <span>{background.alt || 'Untitled visual'}</span>
              </li>
            ))}
          </ol>
        </article>
        <article className="admin-dashboard__card">
          <h2>Footer &amp; socials</h2>
          <p className="admin-dashboard__metric">{footerLinks.length}</p>
          <p className="admin-dashboard__sub">connected platforms</p>
          <ul className="admin-dashboard__list" aria-label="Social accounts">
            {footerLinks.map((link) => (
              <li key={link.url}>
                <span>{link.name}</span>
                <span className="admin-dashboard__muted">{link.url}</span>
              </li>
            ))}
          </ul>
          <p className="admin-dashboard__hint">Configure icons and URLs under Footer settings.</p>
        </article>
      </div>
    </section>
  );
};
