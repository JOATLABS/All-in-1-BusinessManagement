import { motion } from 'framer-motion';
import { panelMotion } from './panelMotion';
import { CloseButton } from './CloseButton';

interface ContactPanelProps {
  onClose: () => void;
}

export const ContactPanel = ({ onClose }: ContactPanelProps) => (
  <motion.aside
    className="panel"
    role="dialog"
    aria-modal="true"
    aria-labelledby="contact-title"
    {...panelMotion}
  >
    <header className="panel__header">
      <div>
        <p className="panel__eyebrow">Partner with us</p>
        <h2 id="contact-title" className="panel__title">
          Contact Us
        </h2>
        <p className="panel__subtitle">Promoters, planners & collaborators</p>
      </div>
      <CloseButton onClick={onClose} />
    </header>
    <form className="panel__form">
      <label className="panel__label" htmlFor="contact-type">
        Enquiry type
      </label>
      <select id="contact-type" name="contact-type" className="panel__select">
        <option value="private-hire">Private hire</option>
        <option value="promoter">Promoter partnership</option>
        <option value="production">Production & AV</option>
        <option value="other">General enquiry</option>
      </select>

      <label className="panel__label" htmlFor="contact-name">
        Name
      </label>
      <input id="contact-name" name="name" type="text" className="panel__input" placeholder="Your full name" />

      <label className="panel__label" htmlFor="contact-email">
        Email
      </label>
      <input id="contact-email" name="email" type="email" className="panel__input" placeholder="you@example.com" />

      <label className="panel__label" htmlFor="contact-message">
        Message
      </label>
      <textarea
        id="contact-message"
        name="message"
        className="panel__textarea"
        placeholder="Share event goals, audience size, or special requests"
      />

      <button type="submit" className="panel__submit">
        Send enquiry
      </button>
    </form>
  </motion.aside>
);
