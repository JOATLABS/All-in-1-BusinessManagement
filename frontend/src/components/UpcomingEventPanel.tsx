import { motion } from 'framer-motion';
import { panelMotion } from './panelMotion';
import { CloseButton } from './CloseButton';
import type { SiteContent } from '../types/content';

interface UpcomingEventPanelProps {
  event: SiteContent['event'];
  onClose: () => void;
}

export const UpcomingEventPanel = ({ event, onClose }: UpcomingEventPanelProps) => (
  <motion.aside className="panel" role="dialog" aria-modal="true" aria-labelledby="event-title" {...panelMotion}>
    <header className="panel__header">
      <div>
        <p className="panel__eyebrow">Upcoming</p>
        <h2 id="event-title" className="panel__title">
          {event.name}
        </h2>
        <p className="panel__subtitle">Hero spotlight</p>
      </div>
      <CloseButton onClick={onClose} />
    </header>
    <div className="panel__body">
      {event.flyer && (
        <div className="panel__flyer">
          <img src={event.flyer} alt={`${event.name} promotional flyer`} />
        </div>
      )}
      <p>{event.description}</p>
      <p className="panel__meta">
        <span>Doors:</span> {event.start.toLocaleString()}
      </p>
      <p className="panel__meta">
        <span>Closes:</span> {event.end.toLocaleString()}
      </p>
    </div>
  </motion.aside>
);
