import { CSSProperties, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import TableVisual from '../components/TableVisual';
import { useSiteContentContext } from '../content/SiteContentProvider';
import type { ReservationTableTier } from '../types/content';
import { ApiError } from '../services/apiClient';
import {
  createReservation as createReservationRequest,
  fetchReservationAvailability
} from '../services/reservationService';
import type { ReservationAvailabilityResponse } from '../types/reservations';

type ModalStep = 'details' | 'payment' | 'confirmation';

interface TierWithAvailability extends ReservationTableTier {
  reservedTotal: number;
  available: number;
}

type TierCardStyle = CSSProperties &
  Record<'--tier-primary' | '--tier-secondary' | '--tier-accent', string>;

const defaultFormState = {
  name: '',
  email: '',
  phone: '',
  guests: '',
  cardNumber: '',
  expiry: '',
  cvc: ''
};

const formatPriceLabel = (template: string, price: string) => template.replace('{price}', price);

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
  const { content, isReady } = useSiteContentContext();
  const { reservation, hero } = content;
  const { heroEyebrow, backLinkLabel, availability: availabilityCopy, carousel, modal } = reservation;
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalTierId, setModalTierId] = useState<string | null>(null);
  const [modalStep, setModalStep] = useState<ModalStep>('details');
  const [formState, setFormState] = useState({ ...defaultFormState });
  const [qrSeed, setQrSeed] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [availability, setAvailability] = useState<ReservationAvailabilityResponse | null>(null);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const detailsNameRef = useRef<HTMLInputElement | null>(null);
  const paymentCardRef = useRef<HTMLInputElement | null>(null);

  const availabilityByTier = useMemo(() => {
    const map = new Map<string, ReservationAvailabilityResponse['tiers'][number]>();
    if (availability) {
      for (const tier of availability.tiers) {
        map.set(tier.tierId, tier);
      }
    }
    return map;
  }, [availability]);

  const tiers = useMemo<TierWithAvailability[]>(() => {
    return reservation.tableTiers.map((tier) => {
      const live = availabilityByTier.get(tier.id);
      const baseReserved = live ? live.baseReserved : Math.min(tier.reserved, tier.total);
      const confirmed = live?.confirmed ?? 0;
      const reservedTotal = Math.min(baseReserved + confirmed, tier.total);
      const available = Math.max(tier.total - reservedTotal, 0);

      return {
        ...tier,
        reservedTotal,
        available
      };
    });
  }, [availabilityByTier, reservation.tableTiers]);

  useEffect(() => {
    if (activeIndex > tiers.length - 1) {
      setActiveIndex(Math.max(tiers.length - 1, 0));
    }
  }, [activeIndex, tiers.length]);

  const totals = useMemo(() => {
    if (availability) {
      return {
        total: availability.summary.total,
        reserved: availability.summary.baseReserved + availability.summary.confirmed,
        available: availability.summary.available
      };
    }

    return tiers.reduce(
      (accumulator, tier) => {
        return {
          total: accumulator.total + tier.total,
          reserved: accumulator.reserved + tier.reservedTotal,
          available: accumulator.available + tier.available
        };
      },
      { total: 0, reserved: 0, available: 0 }
    );
  }, [availability, tiers]);

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

  const loadAvailability = useCallback(async () => {
    try {
      setIsAvailabilityLoading(true);
      const response = await fetchReservationAvailability();
      setAvailability(response);
      setAvailabilityError(null);
    } catch (error) {
      console.error('Failed to refresh live availability', error);
      setAvailabilityError('Unable to refresh live availability. Showing the latest known counts.');
    } finally {
      setIsAvailabilityLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isReady) {
      void loadAvailability();
    }
  }, [isReady, loadAvailability]);

  const closeModal = useCallback(() => {
    setModalTierId(null);
    setModalStep('details');
    setQrSeed(null);
    setModalError(null);
    setFormState({ ...defaultFormState });
    setIsSubmitting(false);
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

  const handlePaymentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!modalTier) {
      return;
    }

    if (modalTier.available <= 0) {
      setModalError('This section just sold out. Choose another size to continue.');
      await loadAvailability();
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

    const guestCount = Number.parseInt(formState.guests, 10);
    if (!Number.isFinite(guestCount) || guestCount <= 0) {
      setModalError('Guest count must be at least 1.');
      return;
    }

    setModalError(null);
    setIsSubmitting(true);

    try {
      const response = await createReservationRequest({
        tierId: modalTier.id,
        guestName: formState.name.trim(),
        email: formState.email.trim(),
        phone: formState.phone.trim() ? formState.phone.trim() : undefined,
        guestCount,
        paymentIntentId: `demo_${Date.now()}`
      });

      setAvailability(response.availability);
      setQrSeed(response.reservation.confirmationCode);
      setModalStep('confirmation');
      setFormState((previous) => ({
        ...previous,
        cardNumber: '',
        expiry: '',
        cvc: ''
      }));
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 409) {
          setModalError(error.message || 'This section just sold out. Choose another size to continue.');
          await loadAvailability();
        } else {
          setModalError(error.message || 'Payment failed. Try again.');
        }
      } else {
        setModalError('Payment failed. Try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
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
    <div className="reserve-experience" data-testid="reserve-page">
      <section
        className="reserve-experience__hero"
        style={{
          backgroundImage: `linear-gradient(rgba(9, 7, 15, 0.8), rgba(9, 7, 15, 0.92)), url(${background.src})`,
          backgroundPosition: background.focalPoint
            ? `${background.focalPoint.x}% ${background.focalPoint.y}%`
            : 'center'
        }}
        aria-labelledby="reserve-heading"
        data-testid="reserve-hero"
      >
        <header className="reserve-experience__hero-inner">
          <Link
            to="/"
            className="reserve-experience__back"
            data-testid="reserve-back-link"
          >
            {backLinkLabel}
          </Link>
          <p className="reserve-experience__eyebrow" data-testid="reserve-hero-eyebrow">
            {heroEyebrow}
          </p>
          <h1 id="reserve-heading" className="reserve-experience__title" data-testid="reserve-hero-title">
            {reservation.title}
          </h1>
          <p className="reserve-experience__subtitle" data-testid="reserve-hero-subtitle">
            {reservation.subtitle}
          </p>
        </header>
      </section>

      <main className="reserve-experience__main">
        <section
          className="reserve-experience__summary"
          aria-labelledby="availability-heading"
          data-testid="reserve-availability"
        >
          <div className="reserve-experience__summary-header">
            <h2 id="availability-heading" data-testid="reserve-availability-heading">
              {availabilityCopy.heading}
            </h2>
            <span
              className="reserve-experience__summary-tag"
              aria-live="polite"
              data-testid="reserve-availability-status"
            >
              {isAvailabilityLoading ? availabilityCopy.loadingLabel : availabilityCopy.liveTag}
            </span>
          </div>
          <div className="reserve-experience__counts">
            <dl>
              <div>
                <dt>{availabilityCopy.openLabel}</dt>
                <dd data-testid="availability-open-count">{totals.available}</dd>
              </div>
              <div>
                <dt>{availabilityCopy.reservedLabel}</dt>
                <dd data-testid="availability-reserved-count">{totals.reserved}</dd>
              </div>
              <div>
                <dt>{availabilityCopy.totalLabel}</dt>
                <dd data-testid="availability-total-count">{totals.total}</dd>
              </div>
            </dl>
          </div>
          <p className="reserve-experience__intro" data-testid="reserve-intro">
            {reservation.intro}
          </p>
          <p className="reserve-experience__note" data-testid="reserve-availability-note">
            {reservation.availabilityNote}
          </p>
          {availabilityError ? (
            <p
              className="reserve-experience__warning"
              role="status"
              data-testid="reserve-availability-error"
            >
              {availabilityError}
            </p>
          ) : null}
        </section>

        <section
          className="reserve-experience__carousel"
          aria-labelledby="tier-heading"
          data-testid="reserve-carousel"
        >
          <header className="reserve-experience__carousel-header">
            <h2 id="tier-heading" data-testid="reserve-carousel-heading">
              {carousel.heading}
            </h2>
            <div className="reserve-experience__carousel-controls">
              <button
                type="button"
                className="reserve-experience__nav"
                onClick={() => setActiveIndex((index) => Math.max(index - 1, 0))}
                disabled={activeIndex === 0}
                aria-label={carousel.previousLabel}
                data-testid="reserve-carousel-previous"
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
                aria-label={carousel.nextLabel}
                data-testid="reserve-carousel-next"
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
              {tiers.map((tier) => {
                const tierCustomProperties: TierCardStyle = {
                  '--tier-primary': tier.visual.primaryColor,
                  '--tier-secondary': tier.visual.secondaryColor,
                  '--tier-accent': tier.visual.accentColor
                };

                return (
                  <li key={tier.id} className="reserve-carousel__slide">
                    <article
                      className={`tier-card tier-card--${tier.visual.pattern}`}
                      style={tierCustomProperties}
                      data-testid={`tier-card-${tier.id}`}
                    >
                      <TableVisual tier={tier} isActive={tier.id === tiers[activeIndex]?.id} />
                      <div className="tier-card__meta">
                        <div>
                          <h3>{tier.label}</h3>
                          <p>{tier.description}</p>
                        </div>
                        <div
                          className="tier-card__available"
                          aria-live="polite"
                          data-testid={`tier-card-${tier.id}-availability`}
                        >
                          <span>{carousel.availableLabel}</span>
                          <strong>{tier.available}</strong>
                        </div>
                      </div>
                      <p className="tier-card__capacity">{tier.capacity}</p>
                      <button
                        type="button"
                        className="tier-card__cta"
                        onClick={() => openModal(tier.id)}
                        disabled={tier.available === 0}
                        data-testid={`tier-card-${tier.id}-reserve`}
                      >
                        {tier.available > 0
                          ? formatPriceLabel(carousel.reserveButtonLabel, tier.price)
                          : carousel.soldOutLabel}
                        </button>
                      </article>
                    </li>
                );
              })}
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
        <div
          className="reserve-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reserve-modal-title"
          data-testid="reservation-modal"
        >
          <div className="reserve-modal__backdrop" onClick={closeModal} aria-hidden="true" />
          <div className="reserve-modal__content">
            <button
              type="button"
              className="reserve-modal__close"
              onClick={closeModal}
              aria-label="Close"
              data-testid="reservation-modal-close"
            >
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
              <aside className="reserve-modal__steps" data-testid="reservation-modal-steps">
                <h3 data-testid="reservation-steps-heading">{modal.stepsHeading}</h3>
                <ol>
                  {reservation.paymentSteps.map((step, index) => (
                    <li
                      key={step}
                      className={index === stepIndex ? 'is-active' : ''}
                      data-testid={`reservation-step-${index + 1}`}
                    >
                      <span>{index + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </aside>
              <div className="reserve-modal__panel">
                {modalStep === 'details' && (
                  <form
                    className="reserve-modal__form"
                    onSubmit={handleDetailsSubmit}
                    data-testid="reservation-details-form"
                  >
                    <h3 data-testid="reservation-details-heading">{modal.detailsHeading}</h3>
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
                    <button
                      type="submit"
                      className="reserve-modal__cta"
                      disabled={isSubmitting}
                      data-testid="reservation-details-submit"
                    >
                      {modal.detailsCtaLabel}
                    </button>
                  </form>
                )}

                {modalStep === 'payment' && (
                  <form
                    className="reserve-modal__form"
                    onSubmit={handlePaymentSubmit}
                    data-testid="reservation-payment-form"
                  >
                    <h3 data-testid="reservation-payment-heading">{modal.paymentHeading}</h3>
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
                    <button
                      type="submit"
                      className="reserve-modal__cta"
                      disabled={isSubmitting}
                      data-testid="reservation-payment-submit"
                    >
                      {isSubmitting
                        ? modal.paymentProcessingLabel
                        : formatPriceLabel(modal.paymentCtaLabel, modalTier.price)}
                    </button>
                  </form>
                )}

                {modalStep === 'confirmation' && qrSeed && (
                  <div
                    className="reserve-modal__confirmation"
                    aria-live="polite"
                    data-testid="reservation-confirmation"
                  >
                    <h3>{reservation.confirmationHeadline}</h3>
                    <p>{reservation.confirmationSubtext}</p>
                    <QrPreview seed={qrSeed} />
                    <p className="reserve-modal__code" data-testid="reservation-confirmation-code">
                      {modal.confirmationCodeLabel}: {qrSeed}
                    </p>
                    <button
                      type="button"
                      className="reserve-modal__cta"
                      onClick={closeModal}
                      data-testid="reservation-confirmation-close"
                    >
                      {modal.confirmationCtaLabel}
                    </button>
                  </div>
                )}
              </div>
            </div>
            {modalError ? (
              <p
                className="reserve-modal__error"
                role="alert"
                data-testid="reservation-modal-error"
              >
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
