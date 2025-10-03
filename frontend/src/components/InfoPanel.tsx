import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { CloseButton } from './CloseButton';
import { panelMotion } from './panelMotion';

interface InfoPanelProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
}

export const InfoPanel = ({ title, subtitle, children, onClose }: InfoPanelProps) => {
  return (
    <motion.aside className="panel" {...panelMotion} transition={{ duration: 0.6, ease: 'easeInOut' }}>
      <div className="panel__header">
        <div>
          <p className="panel__eyebrow">Experience</p>
          <h2 className="panel__title">{title}</h2>
          {subtitle && <p className="panel__subtitle">{subtitle}</p>}
        </div>
        <CloseButton onClick={onClose} />
      </div>
      <div className="panel__content">{children}</div>
    </motion.aside>
  );
};
