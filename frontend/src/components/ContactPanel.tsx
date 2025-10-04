import { motion } from 'framer-motion';
import { panelMotion } from './panelMotion';
import { CloseButton } from './CloseButton';

interface ContactPanelContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  topics: Array<{ value: string; label: string }>;
  messagePlaceholder: string;
  submitLabel: string;
}

interface ContactPanelProps {
  onClose: () => void;
  content: ContactPanelContent;
}

export const ContactPanel = ({ onClose, content }: ContactPanelProps) => (
  <motion.aside
    className="panel"
    role="dialog"
    aria-modal="true"
    aria-labelledby="contact-title"
    {...panelMotion}
  >
    <header className="panel__header">
      <div>
        <p className="panel__eyebrow">{content.eyebrow}</p>
        <h2 id="contact-title" className="panel__title">
          {content.title}
        </h2>
        <p className="panel__subtitle">{content.subtitle}</p>
      </div>
      <CloseButton onClick={onClose} />
    </header>
    <form className="panel__form">
      <label className="panel__label" htmlFor="contact-type">
        Enquiry type
      </label>
      <select id="contact-type" name="contact-type" className="panel__select">
        {content.topics.map((topic) => (
          <option key={topic.value} value={topic.value}>
            {topic.label}
          </option>
        ))}
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
        placeholder={content.messagePlaceholder}
      />

      <button type="submit" className="panel__submit">
        {content.submitLabel}
      </button>
    </form>
  </motion.aside>
);
