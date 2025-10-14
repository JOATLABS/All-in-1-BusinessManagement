import { Link } from 'react-router-dom';

import './mobile-app.css';

const featureHighlights = [
  {
    label: 'Average spend',
    value: '$1,850'
  },
  {
    label: 'Cancellations',
    value: '3.2%'
  },
  {
    label: 'Rating',
    value: '4.8 / 5'
  }
];

const operationalFocusAreas = [
  {
    title: 'Guest List & Table Management',
    description:
      'Get real-time updates on every section, assign bottle service staff, and guarantee guests have a smooth experience from arrival to last call.'
  },
  {
    title: 'Digital Tickets & Deposits',
    description:
      'Issue digital tickets to promoters, track prepayments, and monitor redemption in real time. Automate deposit reminders and lockdown reservations before the night starts.'
  },
  {
    title: 'Promoter & Employee Management',
    description:
      'Align your entire team with live performance dashboards. Share the same reservation data across the bar, the floor, and marketing without forwarding spreadsheets.'
  }
];

const clientInsights = [
  {
    title: 'Know your clients',
    copy:
      'Build repeat business with snapshots that highlight high-value spenders, regulars, and friends of promoters. See preferences, visit history, and bottle orders in a single profile so staff can personalise the next night out.'
  },
  {
    title: 'Messaging that converts',
    copy:
      'Send SMS or social follow-ups straight from the booking view. Track who confirms, who needs a reminder, and who opens special offers without leaving the app.'
  }
];

export const MobileAppLandingPage = () => (
  <div className="mobile-app-page">
    <section className="mobile-app-page__hero" aria-labelledby="mobile-app-hero-title">
      <div className="mobile-app-page__hero-content">
        <p className="mobile-app-page__eyebrow">Built for nightlife teams</p>
        <h1 id="mobile-app-hero-title" className="mobile-app-page__title">
          Get more reservations
        </h1>
        <p className="mobile-app-page__lead">
          Mr. Black’s mobile command centre gives you a live view of revenue, deposits, and bottle service so every promoter and VIP host stays in sync all night.
        </p>
        <div className="mobile-app-page__hero-actions">
          <Link to="/reserve" className="mobile-app-page__cta" aria-label="Book a demo and start capturing reservations">
            Book a demo
          </Link>
          <a className="mobile-app-page__cta mobile-app-page__cta--secondary" href="tel:+18335551234">
            <span aria-hidden="true" className="mobile-app-page__cta-icon" />
            Call us 24/7
          </a>
        </div>
      </div>

      <div className="mobile-app-page__mockup" role="presentation" aria-hidden="true">
        <div className="mobile-app-page__mockup-screen">
          <header className="mobile-app-page__mockup-header">
            <span className="mobile-app-page__mockup-pill">New Year&#39;s Eve</span>
            <strong className="mobile-app-page__mockup-total">$18,450</strong>
          </header>
          <div className="mobile-app-page__mockup-grid">
            {featureHighlights.map((item) => (
              <div key={item.label} className="mobile-app-page__mockup-card">
                <span className="mobile-app-page__mockup-label">{item.label}</span>
                <span className="mobile-app-page__mockup-value">{item.value}</span>
              </div>
            ))}
          </div>
          <footer className="mobile-app-page__mockup-footer">
            <span className="mobile-app-page__mockup-chip">Bottle service</span>
            <span className="mobile-app-page__mockup-chip">VIP arrivals</span>
            <span className="mobile-app-page__mockup-chip">Deposits paid</span>
          </footer>
        </div>
      </div>
    </section>

    <section className="mobile-app-page__section" aria-labelledby="mobile-app-operations-title">
      <div className="mobile-app-page__section-header">
        <p className="mobile-app-page__section-eyebrow">Operations</p>
        <h2 id="mobile-app-operations-title" className="mobile-app-page__section-title">
          Built specifically for nightclubs &amp; bars
        </h2>
        <p className="mobile-app-page__section-description">
          Replace static sheets with a live operating picture. Assign staff, track deposits, and collaborate on guest recovery without losing your place in line.
        </p>
      </div>

      <div className="mobile-app-page__feature-list">
        {operationalFocusAreas.map((feature) => (
          <article key={feature.title} className="mobile-app-page__feature-card">
            <h3 className="mobile-app-page__feature-title">{feature.title}</h3>
            <p className="mobile-app-page__feature-copy">{feature.description}</p>
          </article>
        ))}
      </div>
    </section>

    <section className="mobile-app-page__section mobile-app-page__section--gradient" aria-labelledby="mobile-app-clients-title">
      <div className="mobile-app-page__section-header">
        <p className="mobile-app-page__section-eyebrow">Relationships</p>
        <h2 id="mobile-app-clients-title" className="mobile-app-page__section-title">
          Know your clients
        </h2>
        <p className="mobile-app-page__section-description">
          Capture the details that keep VIPs coming back. Segment by spend, promoter, or vibe and surprise loyal guests with unforgettable experiences.
        </p>
      </div>

      <div className="mobile-app-page__insights">
        {clientInsights.map((insight) => (
          <article key={insight.title} className="mobile-app-page__insight-card">
            <h3 className="mobile-app-page__insight-title">{insight.title}</h3>
            <p className="mobile-app-page__insight-copy">{insight.copy}</p>
          </article>
        ))}
      </div>
    </section>

    <section className="mobile-app-page__footer">
      <div className="mobile-app-page__footer-card" aria-labelledby="mobile-app-footer-title">
        <div>
          <h2 id="mobile-app-footer-title" className="mobile-app-page__footer-title">
            Ready to see it in action?
          </h2>
          <p className="mobile-app-page__footer-copy">
            Schedule a walk-through and bring Mr. Black onto the floor this weekend. We&#39;ll migrate your guest lists and set your promoters up in minutes.
          </p>
        </div>
        <div className="mobile-app-page__footer-actions">
          <a className="mobile-app-page__cta" href="https://learn.mrblackapp.com" rel="noreferrer" target="_blank">
            Visit learn.mrblackapp.com
          </a>
          <a className="mobile-app-page__cta mobile-app-page__cta--secondary" href="mailto:hello@mrblackapp.com">
            Email our team
          </a>
        </div>
      </div>
    </section>
  </div>
);

export default MobileAppLandingPage;
