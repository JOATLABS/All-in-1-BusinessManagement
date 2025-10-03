import { Link, useOutletContext } from 'react-router-dom';
import type { SiteContent } from '../../types/content';

interface AdminOutletContext {
  siteContent: SiteContent;
}

const formatDateTime = (date: Date) =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);

export const DashboardPage = () => {
  const { siteContent } = useOutletContext<AdminOutletContext>();
  const { event, hero } = siteContent;

  return (
    <div className="admin-dashboard">
      <section className="admin-dashboard__hero">
        <h2>{hero.name}</h2>
        <p>{hero.tagline}</p>
        <div className="admin-dashboard__actions">
          <Link className="admin-dashboard__cta" to="/admin/site-configuration">
            Configure site content
          </Link>
          <a className="admin-dashboard__cta admin-dashboard__cta--secondary" href="/">
            View customer experience
          </a>
        </div>
      </section>

      <div className="admin-dashboard__grid">
        <article className="admin-card">
          <header>
            <h3>Next Experience</h3>
            <p>{event.name}</p>
          </header>
          <dl>
            <div>
              <dt>Opens</dt>
              <dd>{formatDateTime(event.start)}</dd>
            </div>
            <div>
              <dt>Closes</dt>
              <dd>{formatDateTime(event.end)}</dd>
            </div>
            <div>
              <dt>Ticketing</dt>
              <dd>{event.requiresTicket ? 'Pre-sale required' : 'Complimentary entry'}</dd>
            </div>
            <div>
              <dt>Concierge hotline</dt>
              <dd>{event.tableHotline}</dd>
            </div>
          </dl>
        </article>

        <article className="admin-card">
          <header>
            <h3>Configuration Coverage</h3>
            <p>All hero, modal, and footer copy is editable in the business platform.</p>
          </header>
          <ul>
            <li>Landing hero backgrounds and marquee keywords</li>
            <li>Upcoming event metadata and flyer assets</li>
            <li>Modal narratives for About, Reserve, Tickets, Contact, and Legal</li>
            <li>Footer navigation, social destinations, and admin link</li>
          </ul>
        </article>

        <article className="admin-card">
          <header>
            <h3>Performance guardrails</h3>
            <p>Media rotation uses 7-second cadence with preloading to keep the hero smooth.</p>
          </header>
          <ul>
            <li>Background pool size: {hero.backgrounds.length} assets</li>
            <li>Copy refresh uses site-content.json with runtime merging</li>
            <li>Contact workflow captures partner intent for follow-up</li>
          </ul>
        </article>
      </div>
    </div>
  );
};

