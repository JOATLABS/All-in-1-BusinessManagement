import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { CloseButton } from './CloseButton';
import { panelMotion } from './panelMotion';
import type { ContactPanelContent } from '../types/content';

interface ContactPanelProps {
  onClose: () => void;
  content: ContactPanelContent;
}

interface ContactFormState {
  name: string;
  email: string;
  company: string;
  enquiry: string;
  message: string;
}

export const ContactPanel = ({ onClose, content }: ContactPanelProps) => {
  const defaultEnquiry = useMemo(() => content.options[0]?.value ?? '', [content.options]);
  const [state, setState] = useState<ContactFormState>({
    name: '',
    email: '',
    company: '',
    enquiry: defaultEnquiry,
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setState({ name: '', email: '', company: '', enquiry: defaultEnquiry, message: '' });
    setSubmitted(false);
  }, [defaultEnquiry, content]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  const handleChange = (key: keyof ContactFormState) => (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setState((prev) => ({ ...prev, [key]: event.target.value }));
  };

  return (
    <motion.aside className="panel" {...panelMotion} transition={{ duration: 0.6, ease: 'easeInOut' }}>
      <div className="panel__header">
        <div>
          <p className="panel__eyebrow">{content.eyebrow}</p>
          <h2 className="panel__title">{content.title}</h2>
          <p className="panel__subtitle">{content.subtitle}</p>
        </div>
        <CloseButton onClick={onClose} />
      </div>
      <div className="panel__content">
        {submitted ? (
          <div className="panel__confirmation">
            <p>{content.successMessage}</p>
          </div>
        ) : (
          <form className="panel__form" onSubmit={handleSubmit}>
            <label>
              <span>{content.nameLabel}</span>
              <input required value={state.name} onChange={handleChange('name')} placeholder={content.namePlaceholder} />
            </label>
            <label>
              <span>{content.emailLabel}</span>
              <input
                required
                type="email"
                value={state.email}
                onChange={handleChange('email')}
                placeholder={content.emailPlaceholder}
              />
            </label>
            <label>
              <span>{content.companyLabel}</span>
              <input value={state.company} onChange={handleChange('company')} placeholder={content.companyPlaceholder} />
            </label>
            <label>
              <span>{content.enquiryLabel}</span>
              <select value={state.enquiry} onChange={handleChange('enquiry')}>
                {content.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>{content.projectLabel}</span>
              <textarea
                value={state.message}
                onChange={handleChange('message')}
                placeholder={content.projectPlaceholder}
                rows={4}
              />
            </label>
            <button type="submit" className="panel__cta">
              {content.submitLabel}
            </button>
          </form>
        )}
      </div>
    </motion.aside>
  );
};
