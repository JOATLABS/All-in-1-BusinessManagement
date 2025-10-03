import { motion } from 'framer-motion';
import type { EventPanelContent, SiteContent } from '../types/content';
import { CloseButton } from './CloseButton';
import { panelMotion } from './panelMotion';

interface UpcomingEventPanelProps {
  event: SiteContent['event'];
  copy: EventPanelContent;
  onClose: () => void;
}

const formatTime = (date: Date) =>
  new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }).format(date);

export const UpcomingEventPanel = ({ event, copy, onClose }: UpcomingEventPanelProps) => (
  <motion.aside className="panel panel--event" {...panelMotion} transition={{ duration: 0.6, ease: 'easeInOut' }}>
    <div className="panel__header">
      <div>
        <p className="panel__eyebrow">{copy.eyebrow}</p>
        <h2 className="panel__title">{event.name}</h2>
        <p className="panel__subtitle">
          {formatTime(event.start)} – {formatTime(event.end)}
        </p>
      </div>
      <CloseButton onClick={onClose} />
    </div>
    <div className="panel__content panel__content--split">
      <div className="panel__flyer">
        <img src={event.flyer} alt={`${event.name} promotional flyer`} />
      </div>
      <div className="panel__details">
        <p>{event.description}</p>
        <div className="panel__section">
          <h3>{copy.headlinersLabel}</h3>
          <ul>
            {event.headliners.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
        <div className="panel__section">
          <h3>{copy.entryLabel}</h3>
          <p>{event.requiresTicket ? copy.entryCopyWhenRequired : copy.entryCopyWhenComplimentary}</p>
        </div>
        {event.calendarUrl && (
          <a className="panel__cta" href={event.calendarUrl} target="_blank" rel="noreferrer">
            {copy.calendarCtaLabel}
          </a>
        )}
      </div>
    </div>
  </motion.aside>
);
