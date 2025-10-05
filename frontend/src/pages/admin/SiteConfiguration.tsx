import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useSiteContentContext } from '../../content/SiteContentProvider';
import { updateSiteContent, type SiteContentResponse } from '../../services/contentService';
import type { EventContent, HeroContent, OverlaysContent, ReservationContent } from '../../types/content';

type TabId = 'hero' | 'about' | 'events' | 'contact' | 'legal';

const tabs: Array<{ id: TabId; label: string }> = [
  { id: 'hero', label: 'Landing Hero' },
  { id: 'about', label: 'About Modal' },
  { id: 'events', label: 'Events & Reservations' },
  { id: 'contact', label: 'Contact Modal' },
  { id: 'legal', label: 'Legal Footer' }
];

const cloneOverlays = (overlays: OverlaysContent) => ({
  about: {
    ...overlays.about,
    paragraphs: [...overlays.about.paragraphs],
    hours: overlays.about.hours.map((hour) => ({ ...hour }))
  },
  tickets: { ...overlays.tickets },
  contact: {
    ...overlays.contact,
    topics: overlays.contact.topics.map((topic) => ({ ...topic }))
  },
  legal: {
    ...overlays.legal,
    terms: [...overlays.legal.terms]
  }
});

type OverlayDraftState = ReturnType<typeof cloneOverlays>;

const cloneReservation = (reservation: ReservationContent) => ({
  ...reservation,
  paymentSteps: [...reservation.paymentSteps],
  tableTiers: reservation.tableTiers.map((tier) => ({
    ...tier,
    visual: { ...tier.visual }
  }))
});

type EventDraftState = {
  name: string;
  description: string;
  flyer: string;
  start: string;
  end: string;
  requiresTicket: boolean;
  tableHotline: string;
};

const heroToDraft = (hero: HeroContent) => ({
  name: hero.name,
  tagline: hero.tagline,
  words: hero.words.join('\n'),
  backgrounds: hero.backgrounds.map((background) => ({ ...background }))
});

const formatDateTimeLocal = (value: Date): string => {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    return '';
  }

  const pad = (segment: number) => segment.toString().padStart(2, '0');

  const year = value.getFullYear();
  const month = pad(value.getMonth() + 1);
  const day = pad(value.getDate());
  const hours = pad(value.getHours());
  const minutes = pad(value.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const eventToDraft = (event: EventContent): EventDraftState => ({
  name: event.name,
  description: event.description,
  flyer: event.flyer,
  start: formatDateTimeLocal(event.start),
  end: formatDateTimeLocal(event.end),
  requiresTicket: event.requiresTicket,
  tableHotline: event.tableHotline
});

export const SiteConfiguration = () => {
  const { content, refresh } = useSiteContentContext();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('hero');
  const [heroDraft, setHeroDraft] = useState(() => heroToDraft(content.hero));
  const [eventDraft, setEventDraft] = useState<EventDraftState>(() => eventToDraft(content.event));
  const [overlayDraft, setOverlayDraft] = useState<OverlayDraftState>(() => cloneOverlays(content.overlays));
  const [reservationDraft, setReservationDraft] = useState(() => cloneReservation(content.reservation));
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [hasChanges, setHasChanges] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const markDirty = useCallback(() => {
    setHasChanges(true);
    setErrorMessage(null);
    if (status === 'saved' || status === 'error') {
      setStatus('idle');
    }
  }, [status]);

  useEffect(() => {
    if (status === 'saved') {
      if (typeof window === 'undefined') {
        return;
      }

      const timeout = window.setTimeout(() => setStatus('idle'), 2500);
      return () => window.clearTimeout(timeout);
    }

    return undefined;
  }, [status]);

  useEffect(() => {
    if (status === 'saving' || hasChanges) {
      return;
    }

    setHeroDraft(heroToDraft(content.hero));
    setEventDraft(eventToDraft(content.event));
    setOverlayDraft(cloneOverlays(content.overlays));
    setReservationDraft(cloneReservation(content.reservation));
  }, [content, hasChanges, status]);

  const handleHeroBackgroundChange = (
    index: number,
    field: 'src' | 'alt' | 'focalPointX' | 'focalPointY',
    value: string
  ) => {
    setHeroDraft((prev) => {
      const nextBackgrounds = prev.backgrounds.map((background, backgroundIndex) => {
        if (backgroundIndex !== index) {
          return background;
        }

        if (field === 'focalPointX') {
          return { ...background, focalPoint: { ...(background.focalPoint ?? { x: 50, y: 50 }), x: Number(value) } };
        }

        if (field === 'focalPointY') {
          return { ...background, focalPoint: { ...(background.focalPoint ?? { x: 50, y: 50 }), y: Number(value) } };
        }

        return { ...background, [field]: value };
      });

      return { ...prev, backgrounds: nextBackgrounds };
    });
    markDirty();
  };

  const handleHeroChange = (field: 'name' | 'tagline' | 'words', value: string) => {
    setHeroDraft((prev) => ({ ...prev, [field]: value }));
    markDirty();
  };

  const handleEventChange = (field: keyof EventDraftState, value: string | boolean) => {
    setEventDraft((prev) => ({ ...prev, [field]: value }));
    markDirty();
  };

  const handleAddBackground = () => {
    setHeroDraft((prev) => ({
      ...prev,
      backgrounds: [
        ...prev.backgrounds,
        { src: '', alt: '', focalPoint: { x: 50, y: 50 } }
      ]
    }));
    markDirty();
  };

  const updateOverlay = <Section extends keyof OverlayDraftState>(
    section: Section,
    value: OverlayDraftState[Section]
  ) => {
    setOverlayDraft((prev) => ({
      ...prev,
      [section]: value
    }));
    markDirty();
  };

  const handleReservationChange = (
    field:
      | 'title'
      | 'subtitle'
      | 'intro'
      | 'availabilityNote'
      | 'confirmationHeadline'
      | 'confirmationSubtext',
    value: string
  ) => {
    setReservationDraft((prev) => ({ ...prev, [field]: value }));
    markDirty();
  };

  const handleReservationStepsChange = (value: string) => {
    setReservationDraft((prev) => ({
      ...prev,
      paymentSteps: value
        .split('\n')
        .map((step) => step.trim())
        .filter(Boolean)
    }));
    markDirty();
  };

  const handleTierChange = (
    index: number,
    field: 'label' | 'capacity' | 'description' | 'price' | 'total' | 'reserved',
    value: string
  ) => {
    setReservationDraft((prev) => {
      const tiers = prev.tableTiers.map((tier, tierIndex) => {
        if (tierIndex !== index) {
          return tier;
        }

        if (field === 'total' || field === 'reserved') {
          const numeric = Number.parseInt(value, 10);
          const safeValue = Number.isFinite(numeric) && !Number.isNaN(numeric) && numeric >= 0
            ? Math.floor(numeric)
            : 0;

          const nextTotal = field === 'total' ? safeValue : tier.total;
          const nextReserved = field === 'reserved' ? Math.min(safeValue, nextTotal) : Math.min(tier.reserved, nextTotal);

          return {
            ...tier,
            total: nextTotal,
            reserved: nextReserved
          };
        }

        return { ...tier, [field]: value };
      });

      return { ...prev, tableTiers: tiers };
    });
    markDirty();
  };

  const handleTierVisualChange = (
    index: number,
    field: 'pattern' | 'primaryColor' | 'secondaryColor' | 'accentColor',
    value: string
  ) => {
    setReservationDraft((prev) => {
      const tiers = prev.tableTiers.map((tier, tierIndex) => {
        if (tierIndex !== index) {
          return tier;
        }

        if (field === 'pattern' && !['grid', 'halo', 'pillars'].includes(value)) {
          return tier;
        }

        return {
          ...tier,
          visual: {
            ...tier.visual,
            [field]: field === 'pattern' ? (value as ReservationContent['tableTiers'][number]['visual']['pattern']) : value
          }
        };
      });

      return { ...prev, tableTiers: tiers };
    });
    markDirty();
  };

  const handleAddTier = () => {
    setReservationDraft((prev) => ({
      ...prev,
      tableTiers: [
        ...prev.tableTiers,
        {
          id: `tier-${prev.tableTiers.length + 1}`,
          label: 'New section',
          capacity: 'Fits 4 guests',
          description: 'Describe this VIP section.',
          price: '$50 deposit',
          total: 0,
          reserved: 0,
          visual: {
            pattern: 'grid',
            primaryColor: '#6366f1',
            secondaryColor: '#a855f7',
            accentColor: '#ffffff1a'
          }
        }
      ]
    }));
    markDirty();
  };

  const handleRemoveTier = (index: number) => {
    setReservationDraft((prev) => {
      if (prev.tableTiers.length <= 1) {
        return prev;
      }

      const tiers = prev.tableTiers.filter((_, tierIndex) => tierIndex !== index);
      return { ...prev, tableTiers: tiers };
    });
    markDirty();
  };

  const handleTicketsChange = (field: keyof OverlayDraftState['tickets'], value: string) => {
    updateOverlay('tickets', { ...overlayDraft.tickets, [field]: value });
  };

  const handleAboutChange = (field: 'title' | 'subtitle', value: string) => {
    updateOverlay('about', { ...overlayDraft.about, [field]: value });
  };

  const handleAboutNarrativeChange = (value: string) => {
    updateOverlay('about', {
      ...overlayDraft.about,
      paragraphs: value.split('\n\n').filter(Boolean)
    });
  };

  const handleAboutHoursChange = (value: string) => {
    updateOverlay('about', {
      ...overlayDraft.about,
      hours: value
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          const [label, ...rest] = line.split(':');
          return { label: label.trim(), value: rest.join(':').trim() };
        })
    });
  };

  const handleContactChange = (field: 'eyebrow' | 'title' | 'subtitle' | 'messagePlaceholder' | 'submitLabel', value: string) => {
    updateOverlay('contact', { ...overlayDraft.contact, [field]: value });
  };

  const handleContactTopicsChange = (value: string) => {
    updateOverlay('contact', {
      ...overlayDraft.contact,
      topics: value
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          const [label, val] = line.split('|');
          return { label: label.trim(), value: (val ?? '').trim() };
        })
    });
  };

  const handleLegalChange = (field: 'title' | 'subtitle' | 'privacyPlaceholder', value: string) => {
    updateOverlay('legal', { ...overlayDraft.legal, [field]: value });
  };

  const handleLegalTermsChange = (value: string) => {
    updateOverlay('legal', {
      ...overlayDraft.legal,
      terms: value.split('\n\n').filter(Boolean)
    });
  };

  const parseEventDate = useCallback((value: string, label: string) => {
    if (!value) {
      throw new Error(`${label} is required.`);
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      throw new Error(`${label} must be a valid date and time.`);
    }

    return parsed;
  }, []);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      setErrorMessage('You must be signed in to save changes.');
      setStatus('error');
      return;
    }

    setStatus('saving');
    setErrorMessage(null);

    const heroWords = heroDraft.words
      .split('\n')
      .map((word) => word.trim())
      .filter(Boolean);

    const heroBackgrounds = heroDraft.backgrounds.map((background) => ({
      ...background,
      focalPoint: background.focalPoint ?? { x: 50, y: 50 }
    }));

    let startDate: Date;
    let endDate: Date;

    try {
      startDate = parseEventDate(eventDraft.start, 'Event start');
      endDate = parseEventDate(eventDraft.end, 'Event end');

      if (endDate.getTime() <= startDate.getTime()) {
        throw new Error('Event end must be after the start time.');
      }
    } catch (validationError) {
      const message =
        validationError instanceof Error ? validationError.message : 'Please correct the event schedule.';
      setErrorMessage(message);
      setStatus('error');
      return;
    }

    const reservationPayload: ReservationContent = {
      title: reservationDraft.title,
      subtitle: reservationDraft.subtitle,
      intro: reservationDraft.intro,
      availabilityNote: reservationDraft.availabilityNote,
      paymentSteps: reservationDraft.paymentSteps.length
        ? [...reservationDraft.paymentSteps]
        : ['Crew details', 'Secure payment', 'Confirmation QR code'],
      confirmationHeadline: reservationDraft.confirmationHeadline,
      confirmationSubtext: reservationDraft.confirmationSubtext,
      tableTiers: (reservationDraft.tableTiers.length ? reservationDraft.tableTiers : content.reservation.tableTiers).map(
        (tier, index) => {
          const total = Math.max(0, Math.floor(tier.total));
          const reserved = Math.min(Math.max(0, Math.floor(tier.reserved)), total);
          const pattern = ['grid', 'halo', 'pillars'].includes(tier.visual.pattern)
            ? tier.visual.pattern
            : 'grid';

          return {
            ...tier,
            id: tier.id?.trim() ? tier.id : `tier-${index + 1}`,
            total,
            reserved,
            visual: {
              ...tier.visual,
              pattern,
              primaryColor: tier.visual.primaryColor?.trim() || '#6366f1',
              secondaryColor: tier.visual.secondaryColor?.trim() || '#a855f7',
              accentColor: tier.visual.accentColor?.trim() || '#ffffff1a'
            }
          };
        }
      )
    };

    const payload: SiteContentResponse = {
      hero: {
        name: heroDraft.name,
        tagline: heroDraft.tagline,
        words: heroWords,
        backgrounds: heroBackgrounds
      },
      event: {
        name: eventDraft.name,
        description: eventDraft.description,
        flyer: eventDraft.flyer,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        requiresTicket: eventDraft.requiresTicket,
        tableHotline: eventDraft.tableHotline
      },
      footer: {
        socials: content.footer.socials.map((social) => ({ ...social }))
      },
      reservation: reservationPayload,
      overlays: overlayDraft
    };

    try {
      await updateSiteContent(token, payload);
      await refresh();
      setStatus('saved');
      setHasChanges(false);
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Unable to save configuration';
      setErrorMessage(message);
      setStatus('error');
    }
  };

  const statusLabel = useMemo(() => {
    if (status === 'saving') {
      return 'Saving updates…';
    }

    if (status === 'saved') {
      return 'Changes saved successfully.';
    }

    if (status === 'error') {
      return errorMessage ?? 'Unable to save changes';
    }

    return hasChanges ? 'Unsaved changes' : 'All changes saved';
  }, [errorMessage, hasChanges, status]);

  return (
    <section>
      <header className="admin-config__header">
        <div>
          <p className="admin-config__eyebrow">Configuration</p>
          <h1>Customer-facing content</h1>
          <p className="admin-config__intro">
            Edit the hero identity, looping backgrounds, overlays, and footer touchpoints before publishing to the landing
            experience.
          </p>
        </div>
        <p className="admin-config__notice" role="status">{statusLabel}</p>
      </header>

      <div className="admin-config__tabs" role="tablist" aria-label="Site configuration sections">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`admin-config__tab${activeTab === tab.id ? ' admin-config__tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-config__panels">
        {activeTab === 'hero' && (
          <form className="admin-config__form" onSubmit={handleSave}>
            <fieldset>
              <legend>Identity</legend>
              <label>
                Club name
                <input
                  value={heroDraft.name}
                  onChange={(event) => handleHeroChange('name', event.target.value)}
                />
              </label>
              <label>
                Tagline
                <input
                  value={heroDraft.tagline}
                  onChange={(event) => handleHeroChange('tagline', event.target.value)}
                />
              </label>
              <label>
                Marquee words
                <textarea
                  rows={3}
                  value={heroDraft.words}
                  onChange={(event) => handleHeroChange('words', event.target.value)}
                />
                <span className="admin-config__hint">Enter one word or phrase per line.</span>
              </label>
            </fieldset>

            <fieldset>
              <legend>Background gallery</legend>
              <div className="admin-config__grid">
                {heroDraft.backgrounds.map((background, index) => (
                  <div key={`background-${index}`} className="admin-config__background">
                    <h3>Layer {index + 1}</h3>
                    <label>
                      Media URL
                      <input
                        value={background.src}
                        onChange={(event) => handleHeroBackgroundChange(index, 'src', event.target.value)}
                        placeholder="https://"
                      />
                    </label>
                    <label>
                      Alt text
                      <input
                        value={background.alt}
                        onChange={(event) => handleHeroBackgroundChange(index, 'alt', event.target.value)}
                      />
                    </label>
                    <div className="admin-config__focal">
                      <label>
                        Focal X (%)
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={background.focalPoint?.x ?? 50}
                          onChange={(event) => handleHeroBackgroundChange(index, 'focalPointX', event.target.value)}
                        />
                      </label>
                      <label>
                        Focal Y (%)
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={background.focalPoint?.y ?? 50}
                          onChange={(event) => handleHeroBackgroundChange(index, 'focalPointY', event.target.value)}
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" className="admin-config__add" onClick={handleAddBackground}>
                Add background
              </button>
            </fieldset>

            <div className="admin-config__actions">
              {status === 'error' && errorMessage ? (
                <p className="admin-config__error" role="alert">{errorMessage}</p>
              ) : null}
              <button type="submit" className="admin-config__save" disabled={!hasChanges || status === 'saving'}>
                {status === 'saving' ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'events' && (
          <form className="admin-config__form" onSubmit={handleSave}>
            <fieldset>
              <legend>Featured event</legend>
              <label>
                Event name
                <input value={eventDraft.name} onChange={(event) => handleEventChange('name', event.target.value)} />
              </label>
              <label>
                Description
                <textarea
                  rows={3}
                  value={eventDraft.description}
                  onChange={(event) => handleEventChange('description', event.target.value)}
                />
              </label>
              <label>
                Flyer URL
                <input value={eventDraft.flyer} onChange={(event) => handleEventChange('flyer', event.target.value)} />
              </label>
              <label>
                Starts at
                <input
                  type="datetime-local"
                  value={eventDraft.start}
                  onChange={(event) => handleEventChange('start', event.target.value)}
                />
              </label>
              <label>
                Ends at
                <input
                  type="datetime-local"
                  value={eventDraft.end}
                  onChange={(event) => handleEventChange('end', event.target.value)}
                />
              </label>
              <label className="admin-config__toggle">
                <input
                  type="checkbox"
                  checked={eventDraft.requiresTicket}
                  onChange={(event) => handleEventChange('requiresTicket', event.target.checked)}
                />
                Requires ticket presale
              </label>
              <label>
                Table hotline
                <input
                  value={eventDraft.tableHotline}
                  onChange={(event) => handleEventChange('tableHotline', event.target.value)}
                />
              </label>
            </fieldset>

            <fieldset>
              <legend>Reservation experience</legend>
              <label>
                Title
                <input
                  value={reservationDraft.title}
                  onChange={(event) => handleReservationChange('title', event.target.value)}
                />
              </label>
              <label>
                Subtitle
                <input
                  value={reservationDraft.subtitle}
                  onChange={(event) => handleReservationChange('subtitle', event.target.value)}
                />
              </label>
              <label>
                Intro copy
                <textarea
                  rows={3}
                  value={reservationDraft.intro}
                  onChange={(event) => handleReservationChange('intro', event.target.value)}
                />
              </label>
              <label>
                Availability note
                <textarea
                  rows={2}
                  value={reservationDraft.availabilityNote}
                  onChange={(event) => handleReservationChange('availabilityNote', event.target.value)}
                />
                <span className="admin-config__hint">
                  Share how frequently counts refresh or how long sections stay on hold during checkout.
                </span>
              </label>
              <label>
                Payment steps
                <textarea
                  rows={3}
                  value={reservationDraft.paymentSteps.join('\n')}
                  onChange={(event) => handleReservationStepsChange(event.target.value)}
                />
                <span className="admin-config__hint">One step per line (e.g. details, payment, confirmation).</span>
              </label>
              <div className="admin-config__grid">
                <label>
                  Confirmation headline
                  <input
                    value={reservationDraft.confirmationHeadline}
                    onChange={(event) => handleReservationChange('confirmationHeadline', event.target.value)}
                  />
                </label>
                <label>
                  Confirmation subtext
                  <input
                    value={reservationDraft.confirmationSubtext}
                    onChange={(event) => handleReservationChange('confirmationSubtext', event.target.value)}
                  />
                </label>
              </div>
            </fieldset>

            <fieldset>
              <legend>VIP sections</legend>
              <p className="admin-config__hint">
                Configure each tier with total sections and how many are already reserved so availability stays accurate.
              </p>
              {reservationDraft.tableTiers.map((tier, index) => (
                <div key={tier.id} className="admin-config__tier">
                  <div className="admin-config__tier-header">
                    <h4>{tier.label || `Tier ${index + 1}`}</h4>
                    <button
                      type="button"
                      className="admin-config__remove"
                      onClick={() => handleRemoveTier(index)}
                      disabled={reservationDraft.tableTiers.length <= 1}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="admin-config__grid">
                    <label>
                      Label
                      <input value={tier.label} onChange={(event) => handleTierChange(index, 'label', event.target.value)} />
                    </label>
                    <label>
                      Capacity note
                      <input
                        value={tier.capacity}
                        onChange={(event) => handleTierChange(index, 'capacity', event.target.value)}
                      />
                    </label>
                  </div>
                  <label>
                    Description
                    <textarea
                      rows={2}
                      value={tier.description}
                      onChange={(event) => handleTierChange(index, 'description', event.target.value)}
                    />
                  </label>
                  <div className="admin-config__grid">
                    <label>
                      Price / deposit label
                      <input value={tier.price} onChange={(event) => handleTierChange(index, 'price', event.target.value)} />
                    </label>
                    <label>
                      Total sections
                      <input
                        type="number"
                        min={0}
                        value={tier.total}
                        onChange={(event) => handleTierChange(index, 'total', event.target.value)}
                      />
                    </label>
                    <label>
                      Reserved sections
                      <input
                        type="number"
                        min={0}
                        value={tier.reserved}
                        onChange={(event) => handleTierChange(index, 'reserved', event.target.value)}
                      />
                    </label>
                  </div>
                  <div className="admin-config__grid">
                    <label>
                      Visual style
                      <select
                        value={tier.visual.pattern}
                        onChange={(event) => handleTierVisualChange(index, 'pattern', event.target.value)}
                      >
                        <option value="grid">Grid mesh</option>
                        <option value="halo">Halo glow</option>
                        <option value="pillars">Pillar lights</option>
                      </select>
                    </label>
                    <label>
                      Primary color
                      <input
                        type="text"
                        value={tier.visual.primaryColor}
                        onChange={(event) => handleTierVisualChange(index, 'primaryColor', event.target.value)}
                        placeholder="#9333ea"
                      />
                    </label>
                    <label>
                      Secondary color
                      <input
                        type="text"
                        value={tier.visual.secondaryColor}
                        onChange={(event) => handleTierVisualChange(index, 'secondaryColor', event.target.value)}
                        placeholder="#f472b6"
                      />
                    </label>
                    <label>
                      Accent overlay
                      <input
                        type="text"
                        value={tier.visual.accentColor}
                        onChange={(event) => handleTierVisualChange(index, 'accentColor', event.target.value)}
                        placeholder="#ffffff1a"
                      />
                    </label>
                  </div>
                </div>
              ))}
              <button type="button" className="admin-config__add" onClick={handleAddTier}>
                Add section tier
              </button>
            </fieldset>

            <fieldset>
              <legend>Ticket overlay</legend>
              <label>
                Title
                <input
                  value={overlayDraft.tickets.title}
                  onChange={(event) => handleTicketsChange('title', event.target.value)}
                />
              </label>
              <label>
                Subtitle
                <input
                  value={overlayDraft.tickets.subtitle}
                  onChange={(event) => handleTicketsChange('subtitle', event.target.value)}
                />
              </label>
              <label>
                Ticket copy
                <textarea
                  rows={2}
                  value={overlayDraft.tickets.ticketCopy}
                  onChange={(event) => handleTicketsChange('ticketCopy', event.target.value)}
                />
              </label>
              <label>
                Complimentary copy
                <textarea
                  rows={2}
                  value={overlayDraft.tickets.fallbackCopy}
                  onChange={(event) => handleTicketsChange('fallbackCopy', event.target.value)}
                />
              </label>
              <label>
                CTA label
                <input
                  value={overlayDraft.tickets.ctaLabel}
                  onChange={(event) => handleTicketsChange('ctaLabel', event.target.value)}
                />
              </label>
              <label>
                CTA URL
                <input
                  value={overlayDraft.tickets.ctaUrl}
                  onChange={(event) => handleTicketsChange('ctaUrl', event.target.value)}
                />
              </label>
            </fieldset>

            <div className="admin-config__actions">
              {status === 'error' && errorMessage ? (
                <p className="admin-config__error" role="alert">{errorMessage}</p>
              ) : null}
              <button type="submit" className="admin-config__save" disabled={!hasChanges || status === 'saving'}>
                {status === 'saving' ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'about' && (
          <form className="admin-config__form" onSubmit={handleSave}>
            <fieldset>
              <legend>Story content</legend>
              <label>
                Title
                <input
                  value={overlayDraft.about.title}
                  onChange={(event) => handleAboutChange('title', event.target.value)}
                />
              </label>
              <label>
                Subtitle
                <input
                  value={overlayDraft.about.subtitle}
                  onChange={(event) => handleAboutChange('subtitle', event.target.value)}
                />
              </label>
              <label>
                Narrative
                <textarea
                  rows={4}
                  value={overlayDraft.about.paragraphs.join('\n\n')}
                  onChange={(event) => handleAboutNarrativeChange(event.target.value)}
                />
                <span className="admin-config__hint">Separate paragraphs with a blank line.</span>
              </label>
              <label>
                Operating hours
                <textarea
                  rows={3}
                  value={overlayDraft.about.hours.map((hour) => `${hour.label}: ${hour.value}`).join('\n')}
                  onChange={(event) => handleAboutHoursChange(event.target.value)}
                />
                <span className="admin-config__hint">Format each line as “Day: hours”.</span>
              </label>
            </fieldset>

            <div className="admin-config__actions">
              {status === 'error' && errorMessage ? (
                <p className="admin-config__error" role="alert">{errorMessage}</p>
              ) : null}
              <button type="submit" className="admin-config__save" disabled={!hasChanges || status === 'saving'}>
                {status === 'saving' ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'contact' && (
          <form className="admin-config__form" onSubmit={handleSave}>
            <fieldset>
              <legend>Contact experience</legend>
              <label>
                Eyebrow
                <input
                  value={overlayDraft.contact.eyebrow}
                  onChange={(event) => handleContactChange('eyebrow', event.target.value)}
                />
              </label>
              <label>
                Title
                <input
                  value={overlayDraft.contact.title}
                  onChange={(event) => handleContactChange('title', event.target.value)}
                />
              </label>
              <label>
                Subtitle
                <input
                  value={overlayDraft.contact.subtitle}
                  onChange={(event) => handleContactChange('subtitle', event.target.value)}
                />
              </label>
              <label>
                Topics
                <textarea
                  rows={3}
                  value={overlayDraft.contact.topics.map((topic) => `${topic.label}|${topic.value}`).join('\n')}
                  onChange={(event) => handleContactTopicsChange(event.target.value)}
                />
                <span className="admin-config__hint">Format each line as “Label|value”.</span>
              </label>
              <label>
                Message placeholder
                <input
                  value={overlayDraft.contact.messagePlaceholder}
                  onChange={(event) => handleContactChange('messagePlaceholder', event.target.value)}
                />
              </label>
              <label>
                Submit label
                <input
                  value={overlayDraft.contact.submitLabel}
                  onChange={(event) => handleContactChange('submitLabel', event.target.value)}
                />
              </label>
            </fieldset>

            <div className="admin-config__actions">
              {status === 'error' && errorMessage ? (
                <p className="admin-config__error" role="alert">{errorMessage}</p>
              ) : null}
              <button type="submit" className="admin-config__save" disabled={!hasChanges || status === 'saving'}>
                {status === 'saving' ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'legal' && (
          <form className="admin-config__form" onSubmit={handleSave}>
            <fieldset>
              <legend>Terms & privacy</legend>
              <label>
                Title
                <input
                  value={overlayDraft.legal.title}
                  onChange={(event) => handleLegalChange('title', event.target.value)}
                />
              </label>
              <label>
                Subtitle
                <input
                  value={overlayDraft.legal.subtitle}
                  onChange={(event) => handleLegalChange('subtitle', event.target.value)}
                />
              </label>
              <label>
                Terms copy
                <textarea
                  rows={5}
                  value={overlayDraft.legal.terms.join('\n\n')}
                  onChange={(event) => handleLegalTermsChange(event.target.value)}
                />
              </label>
              <label>
                Privacy placeholder
                <textarea
                  rows={3}
                  value={overlayDraft.legal.privacyPlaceholder}
                  onChange={(event) => handleLegalChange('privacyPlaceholder', event.target.value)}
                />
              </label>
            </fieldset>

            <div className="admin-config__actions">
              {status === 'error' && errorMessage ? (
                <p className="admin-config__error" role="alert">{errorMessage}</p>
              ) : null}
              <button type="submit" className="admin-config__save" disabled={!hasChanges || status === 'saving'}>
                {status === 'saving' ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};
