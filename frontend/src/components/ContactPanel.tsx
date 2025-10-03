import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { CloseButton } from './CloseButton';
import { panelMotion } from './panelMotion';

interface ContactPanelProps {
  onClose: () => void;
}

interface ContactFormState {
  name: string;
  email: string;
  company: string;
  enquiry: 'promoter' | 'event-planner' | 'partnership';
  message: string;
}

const initialState: ContactFormState = {
  name: '',
  email: '',
  company: '',
  enquiry: 'promoter',
  message: ''
};

export const ContactPanel = ({ onClose }: ContactPanelProps) => {
  const [state, setState] = useState(initialState);
  const [submitted, setSubmitted] = useState(false);

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
          <p className="panel__eyebrow">Collaborate</p>
          <h2 className="panel__title">Partner with OjaPlus</h2>
          <p className="panel__subtitle">For promoters, event architects, and brand activations</p>
        </div>
        <CloseButton onClick={onClose} />
      </div>
      <div className="panel__content">
        {submitted ? (
          <div className="panel__confirmation">
            <p>Thank you. Our partnerships team will respond within one business day.</p>
          </div>
        ) : (
          <form className="panel__form" onSubmit={handleSubmit}>
            <label>
              <span>Full name</span>
              <input required value={state.name} onChange={handleChange('name')} placeholder="Adaeze Lawson" />
            </label>
            <label>
              <span>Email</span>
              <input
                required
                type="email"
                value={state.email}
                onChange={handleChange('email')}
                placeholder="partners@agency.com"
              />
            </label>
            <label>
              <span>Company / Collective</span>
              <input value={state.company} onChange={handleChange('company')} placeholder="Pulse Syndicate" />
            </label>
            <label>
              <span>Enquiry type</span>
              <select value={state.enquiry} onChange={handleChange('enquiry')}>
                <option value="promoter">Promoter collaboration</option>
                <option value="event-planner">Private experience buildout</option>
                <option value="partnership">Brand partnership</option>
              </select>
            </label>
            <label>
              <span>Project vision</span>
              <textarea
                value={state.message}
                onChange={handleChange('message')}
                placeholder="Share your audience, preferred dates, and any special production requests."
                rows={4}
              />
            </label>
            <button type="submit" className="panel__cta">
              Submit enquiry
            </button>
          </form>
        )}
      </div>
    </motion.aside>
  );
};
