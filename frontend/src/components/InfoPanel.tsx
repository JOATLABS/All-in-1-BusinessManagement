import type { PropsWithChildren, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { panelMotion } from './panelMotion';
import { CloseButton } from './CloseButton';

interface InfoPanelProps extends PropsWithChildren {
  title: string;
  subtitle?: string;
  onClose: () => void;
  actions?: ReactNode;
}

export const InfoPanel = ({ title, subtitle, children, onClose, actions }: InfoPanelProps) => (
  <motion.aside className="panel" role="dialog" aria-modal="true" aria-labelledby="panel-title" {...panelMotion}>
    <header className="panel__header">
      <div>
        <p className="panel__eyebrow">OjaPlus Nightclub</p>
        <h2 id="panel-title" className="panel__title">
          {title}
        </h2>
        {subtitle && <p className="panel__subtitle">{subtitle}</p>}
      </div>
      <CloseButton onClick={onClose} />
    </header>
    <div className="panel__body">{children}</div>
    {actions && <div className="panel__actions">{actions}</div>}
  </motion.aside>
);
