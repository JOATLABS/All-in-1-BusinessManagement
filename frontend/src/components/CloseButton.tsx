interface CloseButtonProps {
  onClick: () => void;
}

export const CloseButton = ({ onClick }: CloseButtonProps) => (
  <button className="panel__close" type="button" onClick={onClick} aria-label="Close panel">
    <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
      <path d="M5.3 6.7 10.6 12l-5.3 5.3 1.4 1.4L12 13.4l5.3 5.3 1.4-1.4L13.4 12l5.3-5.3-1.4-1.4L12 10.6 6.7 5.3z" />
    </svg>
  </button>
);
