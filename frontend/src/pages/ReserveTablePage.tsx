import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSiteContentContext } from '../content/SiteContentProvider';
import type { ReservationTableTier } from '../types/content';

type ModalStep = 'details' | 'payment' | 'confirmation';

interface TierWithAvailability extends ReservationTableTier {
  reservedTotal: number;
  available: number;
}

const defaultFormState = {
  name: '',
  email: '',
  phone: '',
  guests: '',
  cardNumber: '',
  expiry: '',
  cvc: ''
};

const generateCodeSeed = (tier: ReservationTableTier, email: string) => {
  const normalisedEmail = email.trim().toLowerCase();
  const timestamp = Date.now().toString(36).toUpperCase();
  const base = `${tier.id}-${normalisedEmail}-${timestamp}`;
  let hash = 7;
  for (const char of base) {
    hash = (hash * 31 + char.charCodeAt(0)) % 1_000_003;
  }

  return `VIP-${tier.id.toUpperCase()}-${hash.toString(36).toUpperCase()}`;
};

const createQrMatrix = (seed: string, size = 21) => {
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  let hash = 0;

  for (const char of seed) {
    hash = (hash * 37 + char.charCodeAt(0)) % 2_147_483_647;
  }

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const isFinder =
        (row < 4 && col < 4) ||
        (row < 4 && col >= size - 4) ||
        (row >= size - 4 && col < 4);

      if (isFinder) {
        const isBorder = row === 0 || row === 3 || col === 0 || col === 3;
        matrix[row][col] = isBorder;
        continue;
      }

      hash = (hash * 48271 + 1) % 2_147_483_647;
      const noise = hash / 2_147_483_647;
      matrix[row][col] = noise > 0.5;
    }
  }

  return matrix;
};

const QrPreview = ({ seed }: { seed: string }) => {
  const matrix = useMemo(() => createQrMatrix(seed), [seed]);
  const size = matrix.length;

  return (
    <svg
      className="reserve-modal__qr"
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="QR code preview"
      shapeRendering="crispEdges"
    >
      <rect width={size} height={size} fill="#ffffff" />
      {matrix.map((row, rowIndex) =>
        row.map((filled, columnIndex) =>
          filled ? (
            <rect
              key={`${rowIndex}-${columnIndex}`}
              x={columnIndex}
              y={rowIndex}
              width={1}
              height={1}
              fill="#09090b"
            />
          ) : null
        )
      )}
    </svg>
  );
};

const ReserveTablePage = () => {
  const { content } = useSiteContentContext();
  const { reservation, hero } = content;
  const [sessionReservations, setSessionReservations] = useState<Record<string, number>>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalTierId, setModalTierId] = useState<string | null>(null);
  const [modalStep, setModalStep] = useState<ModalStep>('details');
  const [formState, setFormState] = useState({ ...defaultFormState });
  const [qrSeed, setQrSeed] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const detailsNameRef = useRef<HTMLInputElement | null>(null);
  const paymentCardRef = useRef<HTMLInputElement | null>(null);

  const tiers = useMemo<TierWithAvailability[]>(() => {
    const base = reservation.tableTiers;
    return base.map((tier) => {
      const sessionReserved = sessionReservations[tier.id] ?? 0;
      const reservedTotal = Math.min(tier.reserved + sessionReserved, tier.total);
      const available = Math.max(tier.total - reservedTotal, 0);

      return {
        ...tier,
        reservedTotal,
        available
      };
    });
  }, [reservation.tableTiers, sessionReservations]);

  useEffect(() => {
    if (activeIndex > tiers.length - 1) {
      setActiveIndex(Math.max(tiers.length - 1, 0));
    }
  }, [activeIndex, tiers.length]);

  const totals = useMemo(
    () =>
      tiers.reduce(
        (accumulator, tier) => {
          return {
            total: accumulator.total + tier.total,
            reserved: accumulator.reserved + tier.reservedTotal,
            available: accumulator.available + tier.available
          };
        },
        { total: 0, reserved: 0, available: 0 }
      ),
    [tiers]
  );

  const background = hero.backgrounds[0] ?? {
    src: '',
    alt: '',
    focalPoint: { x: 50, y: 50 }
  };

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    const previousTitle = document.title;
    const nextTitle = `${reservation.title} | ${hero.name}`;
    document.title = nextTitle;

    const head = document.head ?? document.getElementsByTagName('head')[0];
    const descriptionSource = reservation.intro || reservation.subtitle;
    let meta = head?.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    const metaExisted = Boolean(meta);
    const previousDescription = meta?.getAttribute('content') ?? null;

    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      head?.appendChild(meta);
    }

    meta?.setAttribute('content', descriptionSource);

    return () => {
      document.title = previousTitle;
      if (meta) {
        if (!metaExisted) {
          meta.parentElement?.removeChild(meta);
        } else if (previousDescription !== null) {
          meta.setAttribute('content', previousDescription);
        } else {
          meta.removeAttribute('content');
        }
      }
    };
  }, [hero.name, reservation.intro, reservation.subtitle, reservation.title]);

  const modalTier = tiers.find((tier) => tier.id === modalTierId) ?? null;
  const isModalOpen = Boolean(modalTier);

  const closeModal = useCallback(() => {
    setModalTierId(null);
    setModalStep('details');
    setQrSeed(null);
    setModalError(null);
    setFormState({ ...defaultFormState });
  }, []);

  useEffect(() => {
    if (!isModalOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeModal, isModalOpen]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    if (isModalOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }

    return undefined;
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    if (modalStep === 'details') {
      detailsNameRef.current?.focus();
    } else if (modalStep === 'payment') {
      paymentCardRef.current?.focus();
    }
  }, [isModalOpen, modalStep]);

  const openModal = (tierId: string) => {
    setModalTierId(tierId);
    setModalStep('details');
    setFormState({ ...defaultFormState });
    setModalError(null);
    setQrSeed(null);
  };

  const handleDetailsSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!modalTier) {
      return;
    }

    if (!formState.name.trim()) {
      setModalError('Add the name for this reservation.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email.trim())) {
      setModalError('Enter a valid email so we can send your QR code.');
      return;
    }

    if (!formState.guests.trim()) {
      setModalError('Let us know how many guests you are bringing.');
      return;
    }

    setModalError(null);
    setModalStep('payment');
  };

  const handlePaymentSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!modalTier) {
      return;
    }

    if (modalTier.available <= 0) {
      setModalError('This section just sold out. Choose another size to continue.');
      return;
    }

    const cardDigits = formState.cardNumber.replace(/\s+/g, '');
    if (!/^\d{12,19}$/.test(cardDigits)) {
      setModalError('Enter a valid card number.');
      return;
    }

    if (!/^(0[1-9]|1[0-2])\/(\d{2})$/.test(formState.expiry.trim())) {
      setModalError('Use MM/YY for the expiry date.');
      return;
    }

    if (!/^\d{3,4}$/.test(formState.cvc.trim())) {
      setModalError('CVC should be 3 or 4 digits.');
      return;
    }

    const nextSeed = generateCodeSeed(modalTier, formState.email);

    setSessionReservations((previous) => {
      const current = previous[modalTier.id] ?? 0;
      return {
        ...previous,
        [modalTier.id]: Math.min(current + 1, modalTier.total)
      };
    });

    setQrSeed(nextSeed);
    setModalStep('confirmation');
    setModalError(null);
  };

  const stepIndex = useMemo(() => {
    if (modalStep === 'details') {
      return 0;
    }

    if (modalStep === 'payment') {
      return Math.min(1, reservation.paymentSteps.length - 1);
    }

    return Math.max(reservation.paymentSteps.length - 1, 0);
  }, [modalStep, reservation.paymentSteps.length]);

  return (
    <div className="reserve-experience">
      <section
        className="reserve-experience__hero"
        style={{
          backgroundImage: `linear-gradient(rgba(9, 7, 15, 0.8), rgba(9, 7, 15, 0.92)), url(${background.src})`,
          backgroundPosition: background.focalPoint
            ? `${background.focalPoint.x}% ${background.focalPoint.y}%`
            : 'center'
        }}
        aria-labelledby="reserve-heading"
      >
        <header className="reserve-experience__hero-inner">
          <Link to="/" className="reserve-experience__back">
            ← Back to experiences
          </Link>
          <p className="reserve-experience__eyebrow">Direct VIP reservations</p>
          <h1 id="reserve-heading" className="reserve-experience__title">
            {reservation.title}
          </h1>
          <p className="reserve-experience__subtitle">{reservation.subtitle}</p>
        </header>
      </section>

      <main className="reserve-experience__main">
        <section className="reserve-experience__summary" aria-labelledby="availability-heading">
          <div className="reserve-experience__summary-header">
            <h2 id="availability-heading">Tonight&apos;s availability</h2>
            <span className="reserve-experience__summary-tag">Live update</span>
          </div>
          <div className="reserve-experience__counts">
            <dl>
              <div>
                <dt>Open sections</dt>
                <dd>{totals.available}</dd>
              </div>
              <div>
                <dt>Already booked</dt>
                <dd>{totals.reserved}</dd>
              </div>
              <div>
                <dt>Total inventory</dt>
                <dd>{totals.total}</dd>
              </div>
            </dl>
          </div>
          <p className="reserve-experience__intro">{reservation.intro}</p>
          <p className="reserve-experience__note">{reservation.availabilityNote}</p>
        </section>

        <section className="reserve-experience__carousel" aria-labelledby="tier-heading">
          <header className="reserve-experience__carousel-header">
            <h2 id="tier-heading">Choose your section</h2>
            <div className="reserve-experience__carousel-controls">
              <button
                type="button"
                className="reserve-experience__nav"
                onClick={() => setActiveIndex((index) => Math.max(index - 1, 0))}
                disabled={activeIndex === 0}
                aria-label="View previous section"
              >
                ‹
              </button>
              <span className="reserve-experience__position">
                {tiers.length === 0 ? '0' : activeIndex + 1} / {tiers.length}
              </span>
              <button
                type="button"
                className="reserve-experience__nav"
                onClick={() => setActiveIndex((index) => Math.min(index + 1, tiers.length - 1))}
                disabled={activeIndex >= tiers.length - 1}
                aria-label="View next section"
              >
                ›
              </button>
            </div>
          </header>
          <div className="reserve-carousel__viewport">
            <ul
              className="reserve-carousel__track"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {tiers.map((tier) => (
                <li key={tier.id} className="reserve-carousel__slide">
                  <article
                    className={`tier-card tier-card--${tier.visual.pattern}`}
                    style={{
                      ['--tier-primary' as const]: tier.visual.primaryColor,
                      ['--tier-secondary' as const]: tier.visual.secondaryColor,
                      ['--tier-accent' as const]: tier.visual.accentColor
                    }}
                  >
                    <div className="tier-card__visual" aria-hidden="true" />
                    <div className="tier-card__meta">
                      <div>
                        <h3>{tier.label}</h3>
                        <p>{tier.description}</p>
                      </div>
                      <div className="tier-card__available" aria-live="polite">
                        <span>Available</span>
                        <strong>{tier.available}</strong>
                      </div>
                    </div>
                    <p className="tier-card__capacity">{tier.capacity}</p>
                    <button
                      type="button"
                      className="tier-card__cta"
                      onClick={() => openModal(tier.id)}
                      disabled={tier.available === 0}
                    >
                      {tier.available > 0 ? `Reserve for ${tier.price}` : 'Sold out'}
                    </button>
                  </article>
                </li>
              ))}
            </ul>
          </div>
          <div className="reserve-carousel__dots" role="tablist" aria-label="Section tiers">
            {tiers.map((tier, index) => (
              <button
                key={tier.id}
                type="button"
                className={index === activeIndex ? 'is-active' : ''}
                onClick={() => setActiveIndex(index)}
                aria-label={`Show ${tier.label}`}
                aria-selected={index === activeIndex}
                role="tab"
              />
            ))}
          </div>
        </section>
      </main>

      {isModalOpen && modalTier ? (
        <div className="reserve-modal" role="dialog" aria-modal="true" aria-labelledby="reserve-modal-title">
          <div className="reserve-modal__backdrop" onClick={closeModal} aria-hidden="true" />
          <div className="reserve-modal__content">
            <button type="button" className="reserve-modal__close" onClick={closeModal} aria-label="Close">
              ×
            </button>
            <header className="reserve-modal__header">
              <p className="reserve-modal__eyebrow">{modalTier.label}</p>
              <h2 id="reserve-modal-title">Reserve the {modalTier.label}</h2>
              <p className="reserve-modal__subtitle">
                {modalTier.capacity} • {modalTier.price}
              </p>
            </header>
            <div className="reserve-modal__layout">
              <aside className="reserve-modal__steps">
                <h3>How it works</h3>
                <ol>
                  {reservation.paymentSteps.map((step, index) => (
                    <li key={step} className={index === stepIndex ? 'is-active' : ''}>
                      <span>{index + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </aside>
              <div className="reserve-modal__panel">
                {modalStep === 'details' && (
                  <form className="reserve-modal__form" onSubmit={handleDetailsSubmit}>
                    <label>
                      Full name
                      <input
                        ref={detailsNameRef}
                        value={formState.name}
                        onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                        autoComplete="name"
                        required
                      />
                    </label>
                    <label>
                      Email for confirmation
                      <input
                        type="email"
                        value={formState.email}
                        onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
                        autoComplete="email"
                        required
                      />
                    </label>
                    <label>
                      Mobile number
                      <input
                        type="tel"
                        value={formState.phone}
                        onChange={(event) => setFormState((prev) => ({ ...prev, phone: event.target.value }))}
                        autoComplete="tel"
                        placeholder="Optional"
                      />
                    </label>
                    <label>
                      Guest count
                      <input
                        type="number"
                        min={1}
                        value={formState.guests}
                        onChange={(event) => setFormState((prev) => ({ ...prev, guests: event.target.value }))}
                        required
                      />
                    </label>
                    <button type="submit" className="reserve-modal__cta">
                      Continue to payment
                    </button>
                  </form>
                )}

                {modalStep === 'payment' && (
                  <form className="reserve-modal__form" onSubmit={handlePaymentSubmit}>
                    <label>
                      Card number
                      <input
                        ref={paymentCardRef}
                        value={formState.cardNumber}
                        onChange={(event) => setFormState((prev) => ({ ...prev, cardNumber: event.target.value }))}
                        inputMode="numeric"
                        autoComplete="cc-number"
                        placeholder="4242 4242 4242 4242"
                        required
                      />
                    </label>
                    <div className="reserve-modal__grid">
                      <label>
                        Expiry (MM/YY)
                        <input
                          value={formState.expiry}
                          onChange={(event) => setFormState((prev) => ({ ...prev, expiry: event.target.value }))}
                          autoComplete="cc-exp"
                          placeholder="08/26"
                          required
                        />
                      </label>
                      <label>
                        CVC
                        <input
                          value={formState.cvc}
                          onChange={(event) => setFormState((prev) => ({ ...prev, cvc: event.target.value }))}
                          autoComplete="cc-csc"
                          inputMode="numeric"
                          placeholder="123"
                          required
                        />
                      </label>
                    </div>
                    <button type="submit" className="reserve-modal__cta">
                      Pay {modalTier.price}
                    </button>
                  </form>
                )}

                {modalStep === 'confirmation' && qrSeed && (
                  <div className="reserve-modal__confirmation" aria-live="polite">
                    <h3>{reservation.confirmationHeadline}</h3>
                    <p>{reservation.confirmationSubtext}</p>
                    <QrPreview seed={qrSeed} />
                    <p className="reserve-modal__code">Confirmation code: {qrSeed}</p>
                    <button type="button" className="reserve-modal__cta" onClick={closeModal}>
                      Done
                    </button>
                  </div>
                )}
              </div>
            </div>
            {modalError ? (
              <p className="reserve-modal__error" role="alert">
                {modalError}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ReserveTablePage;
