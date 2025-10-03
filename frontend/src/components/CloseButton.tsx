import type { ButtonHTMLAttributes } from 'react';

export const CloseButton = ({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button type="button" className={`panel__close ${className ?? ''}`.trim()} {...props}>
    <span className="sr-only">Close panel</span>
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.34 5.27 5.27 6.34 10.93 12l-5.66 5.66 1.07 1.07L12 13.07l5.66 5.66 1.07-1.07L13.07 12l5.66-5.66-1.07-1.07L12 10.93z" />
    </svg>
  </button>
);
