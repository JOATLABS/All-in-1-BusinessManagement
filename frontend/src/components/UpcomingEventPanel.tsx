import { motion } from 'framer-motion';
import { CloseButton } from './CloseButton';
import { panelMotion } from './panelMotion';

interface UpcomingEvent {
  name: string;
  start: Date;
  end: Date;
  flyer: string;
  description: string;
  headliners: string[];
  requiresTicket: boolean;
  tableHotline: string;
}

interface UpcomingEventPanelProps {
  event: UpcomingEvent;
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

export const UpcomingEventPanel = ({ event, onClose }: UpcomingEventPanelProps) => (
  <motion.aside className="panel panel--event" {...panelMotion} transition={{ duration: 0.6, ease: 'easeInOut' }}>
    <div className="panel__header">
      <div>
        <p className="panel__eyebrow">Upcoming Event</p>
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
          <h3>Headliners</h3>
          <ul>
            {event.headliners.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
        <div className="panel__section">
          <h3>Entry</h3>
          <p>{event.requiresTicket ? 'Pre-sale ticket required after 11 PM.' : 'Complimentary entry all night.'}</p>
        </div>
        <a className="panel__cta" href="https://calendar.google.com" target="_blank" rel="noreferrer">
          Add to calendar
        </a>
      </div>
    </div>
  </motion.aside>
);
