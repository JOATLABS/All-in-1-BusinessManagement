import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useSiteContentContext } from '../../content/SiteContentProvider';
import { useUnsavedChangesPrompt } from '../../hooks/useUnsavedChangesPrompt';
import { updateSiteContent, type SiteContentResponse } from '../../services/contentService';
import type { EventContent, FooterContent, HeroContent, OverlaysContent, ReservationContent, BackgroundImage } from '../../types/content';
import { BackgroundMediaManager } from '../../components/BackgroundMediaManager';

type TabId = 'hero' | 'about' | 'tickets' | 'reservations' | 'contact' | 'footer' | 'legal';

const tabs: Array<{ id: TabId; label: string }> = [
  { id: 'hero', label: 'Landing Hero' },
  { id: 'about', label: 'About Modal' },
  { id: 'tickets', label: 'Tickets Overlay' },
  { id: 'reservations', label: 'Reservations' },
  { id: 'contact', label: 'Contact Modal' },
  { id: 'footer', label: 'Footer & Social' },
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
  availability: { ...reservation.availability },
  carousel: { ...reservation.carousel },
  modal: { ...reservation.modal },
  paymentSteps: [...reservation.paymentSteps],
  tableTiers: reservation.tableTiers.map((tier) => ({
    ...tier,
    visual: { ...tier.visual }
  }))
});

type FooterIcon = NonNullable<FooterContent['socials'][number]['icon']>;

type FooterDraftState = {
  socials: Array<{
    name: string;
    icon?: FooterIcon;
    url: string;
  }>;
};

const heroToDraft = (hero: HeroContent) => ({
  name: hero.name,
  tagline: hero.tagline,
  words: hero.words.join('\n'),
  backgrounds: hero.backgrounds.map((background) => ({ ...background }))
});

const footerToDraft = (footer: FooterContent): FooterDraftState => ({
  socials: footer.socials.map((social) => ({ ...social }))
});

export const SiteConfiguration = () => {
  const { content, isReady, refresh } = useSiteContentContext();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('hero');
  const [heroDraft, setHeroDraft] = useState(() => heroToDraft(content.hero));
  const [overlayDraft, setOverlayDraft] = useState<OverlayDraftState>(() => cloneOverlays(content.overlays));
  const [reservationDraft, setReservationDraft] = useState(() => cloneReservation(content.reservation));
  const [footerDraft, setFooterDraft] = useState<FooterDraftState>(() => footerToDraft(content.footer));
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [hasChanges, setHasChanges] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useUnsavedChangesPrompt(hasChanges);

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
    setOverlayDraft(cloneOverlays(content.overlays));
    setReservationDraft(cloneReservation(content.reservation));
    setFooterDraft(footerToDraft(content.footer));
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
      | 'heroEyebrow'
      | 'backLinkLabel'
      | 'intro'
      | 'availabilityNote'
      | 'confirmationHeadline'
      | 'confirmationSubtext',
    value: string
  ) => {
    setReservationDraft((prev) => ({ ...prev, [field]: value }));
    markDirty();
  };

  const handleReservationAvailabilityChange = (
    field: keyof ReservationContent['availability'],
    value: string
  ) => {
    setReservationDraft((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [field]: value
      }
    }));
    markDirty();
  };

  const handleReservationCarouselChange = (
    field: keyof ReservationContent['carousel'],
    value: string
  ) => {
    setReservationDraft((prev) => ({
      ...prev,
      carousel: {
        ...prev.carousel,
        [field]: value
      }
    }));
    markDirty();
  };

  const handleReservationModalChange = (
    field: keyof ReservationContent['modal'],
    value: string
  ) => {
    setReservationDraft((prev) => ({
      ...prev,
      modal: {
        ...prev.modal,
        [field]: value
      }
    }));
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
          price: '$50',
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

  const handleAddSocial = () => {
    setFooterDraft((prev) => ({
      socials: [
        ...prev.socials,
        { name: 'New link', icon: 'instagram', url: '' }
      ]
    }));
    markDirty();
  };

  const handleRemoveSocial = (index: number) => {
    setFooterDraft((prev) => ({
      socials: prev.socials.filter((_, socialIndex) => socialIndex !== index)
    }));
    markDirty();
  };

  const handleSocialChange = (
    index: number,
    field: 'name' | 'icon' | 'url',
    value: string
  ) => {
    setFooterDraft((prev) => ({
      socials: prev.socials.map((social, socialIndex) => {
        if (socialIndex !== index) {
          return social;
        }

        return { ...social, [field]: value };
      })
    }));
    markDirty();
  };

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

    const reservationPayload: ReservationContent = {
      title: reservationDraft.title,
      subtitle: reservationDraft.subtitle,
      heroEyebrow: reservationDraft.heroEyebrow,
      backLinkLabel: reservationDraft.backLinkLabel,
      intro: reservationDraft.intro,
      availabilityNote: reservationDraft.availabilityNote,
      availability: { ...reservationDraft.availability },
      carousel: { ...reservationDraft.carousel },
      modal: { ...reservationDraft.modal },
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
        name: content.event.name,
        description: content.event.description,
        flyer: content.event.flyer,
        start: content.event.start instanceof Date ? content.event.start.toISOString() : content.event.start,
        end: content.event.end instanceof Date ? content.event.end.toISOString() : content.event.end,
        requiresTicket: content.event.requiresTicket,
        tableHotline: content.event.tableHotline
      },
      footer: {
        socials: footerDraft.socials.map((social) => {
          const allowedIcons: FooterIcon[] = ['instagram', 'facebook', 'tiktok', 'x'];
          const icon = social.icon && allowedIcons.includes(social.icon) ? social.icon : undefined;
          return { name: social.name, url: social.url, icon };
        })
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

  if (!isReady) {
    return (
      <section>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Loading configuration...</p>
        </div>
      </section>
    );
  }

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
                Logo URL (displayed beside club name)
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={heroDraft.logoUrl || ''}
                  onChange={(event) => handleHeroChange('logoUrl', event.target.value || undefined)}
                />
                <span className="admin-config__hint">Small logo image (max 80px tall recommended) shown on left and right of club name</span>
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
              <BackgroundMediaManager
                backgrounds={heroDraft.backgrounds}
                onChange={(updatedBackgrounds: BackgroundImage[]) => {
                  setHeroDraft((prev) => ({ ...prev, backgrounds: updatedBackgrounds }));
                }}
              />
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

        {activeTab === 'tickets' && (
          <form className="admin-config__form" onSubmit={handleSave}>
            <fieldset>
              <legend>Ticket overlay content</legend>
              <p className="admin-config__hint">
                Configure the tickets overlay that appears when users click the "Ticket Pre-Sale" button. This shows ticket information for events.
              </p>
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
                Ticket copy (when event requires tickets)
                <textarea
                  rows={2}
                  value={overlayDraft.tickets.ticketCopy}
                  onChange={(event) => handleTicketsChange('ticketCopy', event.target.value)}
                />
                <span className="admin-config__hint">Shown when the event requires paid tickets.</span>
              </label>
              <label>
                Complimentary copy (free entry)
                <textarea
                  rows={2}
                  value={overlayDraft.tickets.fallbackCopy}
                  onChange={(event) => handleTicketsChange('fallbackCopy', event.target.value)}
                />
                <span className="admin-config__hint">Shown when entry is free.</span>
              </label>
              <label>
                CTA button label
                <input
                  value={overlayDraft.tickets.ctaLabel}
                  onChange={(event) => handleTicketsChange('ctaLabel', event.target.value)}
                />
              </label>
              <label>
                Default ticket URL
                <input
                  value={overlayDraft.tickets.ctaUrl}
                  onChange={(event) => handleTicketsChange('ctaUrl', event.target.value)}
                />
                <span className="admin-config__hint">Used if event doesn't have a specific ticket URL.</span>
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

        {activeTab === 'reservations' && (
          <form className="admin-config__form" onSubmit={handleSave}>
            <fieldset>
              <legend>Reservation experience</legend>
              <p className="admin-config__hint">
                Configure the VIP table reservation flow and content. Events are managed separately in the Events page.
              </p>
              <label>
                Title
                <input
                  value={reservationDraft.title}
                  onChange={(event) => handleReservationChange('title', event.target.value)}
                  data-testid="reservation-title-input"
                />
              </label>
              <label>
                Subtitle
                <input
                  value={reservationDraft.subtitle}
                  onChange={(event) => handleReservationChange('subtitle', event.target.value)}
                  data-testid="reservation-subtitle-input"
                />
              </label>
              <label>
                Hero eyebrow
                <input
                  value={reservationDraft.heroEyebrow}
                  onChange={(event) => handleReservationChange('heroEyebrow', event.target.value)}
                  data-testid="reservation-hero-eyebrow-input"
                />
              </label>
              <label>
                Back link label
                <input
                  value={reservationDraft.backLinkLabel}
                  onChange={(event) => handleReservationChange('backLinkLabel', event.target.value)}
                  data-testid="reservation-back-link-input"
                />
              </label>
              <label>
                Intro copy
                <textarea
                  rows={3}
                  value={reservationDraft.intro}
                  onChange={(event) => handleReservationChange('intro', event.target.value)}
                  data-testid="reservation-intro-input"
                />
              </label>
              <label>
                Availability note
                <textarea
                  rows={2}
                  value={reservationDraft.availabilityNote}
                  onChange={(event) => handleReservationChange('availabilityNote', event.target.value)}
                  data-testid="reservation-availability-note-input"
                />
                <span className="admin-config__hint">
                  Share how frequently counts refresh or how long sections stay on hold during checkout.
                </span>
              </label>
              <h4>Availability labels</h4>
              <div className="admin-config__grid">
                <label>
                  Availability heading
                  <input
                    value={reservationDraft.availability.heading}
                    onChange={(event) => handleReservationAvailabilityChange('heading', event.target.value)}
                    data-testid="reservation-availability-heading-input"
                  />
                </label>
                <label>
                  Live badge label
                  <input
                    value={reservationDraft.availability.liveTag}
                    onChange={(event) => handleReservationAvailabilityChange('liveTag', event.target.value)}
                    data-testid="reservation-availability-live-tag-input"
                  />
                </label>
              </div>
              <div className="admin-config__grid">
                <label>
                  Loading badge label
                  <input
                    value={reservationDraft.availability.loadingLabel}
                    onChange={(event) => handleReservationAvailabilityChange('loadingLabel', event.target.value)}
                    data-testid="reservation-availability-loading-input"
                  />
                </label>
                <label>
                  Open sections label
                  <input
                    value={reservationDraft.availability.openLabel}
                    onChange={(event) => handleReservationAvailabilityChange('openLabel', event.target.value)}
                    data-testid="reservation-open-label-input"
                  />
                </label>
              </div>
              <div className="admin-config__grid">
                <label>
                  Reserved sections label
                  <input
                    value={reservationDraft.availability.reservedLabel}
                    onChange={(event) => handleReservationAvailabilityChange('reservedLabel', event.target.value)}
                    data-testid="reservation-reserved-label-input"
                  />
                </label>
                <label>
                  Total sections label
                  <input
                    value={reservationDraft.availability.totalLabel}
                    onChange={(event) => handleReservationAvailabilityChange('totalLabel', event.target.value)}
                    data-testid="reservation-total-label-input"
                  />
                </label>
              </div>
              <h4>Carousel copy</h4>
              <div className="admin-config__grid">
                <label>
                  Carousel heading
                  <input
                    value={reservationDraft.carousel.heading}
                    onChange={(event) => handleReservationCarouselChange('heading', event.target.value)}
                    data-testid="reservation-carousel-heading-input"
                  />
                </label>
                <label>
                  Previous section label
                  <input
                    value={reservationDraft.carousel.previousLabel}
                    onChange={(event) => handleReservationCarouselChange('previousLabel', event.target.value)}
                    data-testid="reservation-carousel-previous-input"
                  />
                </label>
              </div>
              <div className="admin-config__grid">
                <label>
                  Next section label
                  <input
                    value={reservationDraft.carousel.nextLabel}
                    onChange={(event) => handleReservationCarouselChange('nextLabel', event.target.value)}
                    data-testid="reservation-carousel-next-input"
                  />
                </label>
                <label>
                  Availability badge label
                  <input
                    value={reservationDraft.carousel.availableLabel}
                    onChange={(event) => handleReservationCarouselChange('availableLabel', event.target.value)}
                    data-testid="reservation-carousel-available-label-input"
                  />
                </label>
              </div>
              <div className="admin-config__grid">
                <label>
                  Reserve button label
                  <input
                    value={reservationDraft.carousel.reserveButtonLabel}
                    onChange={(event) => handleReservationCarouselChange('reserveButtonLabel', event.target.value)}
                    data-testid="reservation-carousel-reserve-label-input"
                  />
                  <span className="admin-config__hint">Use {'{price}'} to insert the tier price.</span>
                </label>
                <label>
                  Sold out label
                  <input
                    value={reservationDraft.carousel.soldOutLabel}
                    onChange={(event) => handleReservationCarouselChange('soldOutLabel', event.target.value)}
                    data-testid="reservation-carousel-soldout-label-input"
                  />
                </label>
              </div>
              <h4>Modal copy</h4>
              <div className="admin-config__grid">
                <label>
                  Steps heading
                  <input
                    value={reservationDraft.modal.stepsHeading}
                    onChange={(event) => handleReservationModalChange('stepsHeading', event.target.value)}
                    data-testid="reservation-modal-steps-heading-input"
                  />
                </label>
                <label>
                  Details form heading
                  <input
                    value={reservationDraft.modal.detailsHeading}
                    onChange={(event) => handleReservationModalChange('detailsHeading', event.target.value)}
                    data-testid="reservation-modal-details-heading-input"
                  />
                </label>
              </div>
              <div className="admin-config__grid">
                <label>
                  Payment form heading
                  <input
                    value={reservationDraft.modal.paymentHeading}
                    onChange={(event) => handleReservationModalChange('paymentHeading', event.target.value)}
                    data-testid="reservation-modal-payment-heading-input"
                  />
                </label>
                <label>
                  Confirmation code label
                  <input
                    value={reservationDraft.modal.confirmationCodeLabel}
                    onChange={(event) => handleReservationModalChange('confirmationCodeLabel', event.target.value)}
                    data-testid="reservation-modal-code-label-input"
                  />
                </label>
              </div>
              <div className="admin-config__grid">
                <label>
                  Details button label
                  <input
                    value={reservationDraft.modal.detailsCtaLabel}
                    onChange={(event) => handleReservationModalChange('detailsCtaLabel', event.target.value)}
                    data-testid="reservation-modal-details-cta-input"
                  />
                </label>
                <label>
                  Payment button label
                  <input
                    value={reservationDraft.modal.paymentCtaLabel}
                    onChange={(event) => handleReservationModalChange('paymentCtaLabel', event.target.value)}
                    data-testid="reservation-modal-payment-cta-input"
                  />
                  <span className="admin-config__hint">Use {'{price}'} to insert the tier price.</span>
                </label>
              </div>
              <div className="admin-config__grid">
                <label>
                  Processing state label
                  <input
                    value={reservationDraft.modal.paymentProcessingLabel}
                    onChange={(event) => handleReservationModalChange('paymentProcessingLabel', event.target.value)}
                    data-testid="reservation-modal-processing-label-input"
                  />
                </label>
                <label>
                  Confirmation button label
                  <input
                    value={reservationDraft.modal.confirmationCtaLabel}
                    onChange={(event) => handleReservationModalChange('confirmationCtaLabel', event.target.value)}
                    data-testid="reservation-modal-confirmation-cta-input"
                  />
                </label>
              </div>
              <label>
                Payment steps
                <textarea
                  rows={3}
                  value={reservationDraft.paymentSteps.join('\n')}
                  onChange={(event) => handleReservationStepsChange(event.target.value)}
                  data-testid="reservation-payment-steps-input"
                />
                <span className="admin-config__hint">One step per line (e.g. details, payment, confirmation).</span>
              </label>
              <div className="admin-config__grid">
                <label>
                  Confirmation headline
                  <input
                    value={reservationDraft.confirmationHeadline}
                    onChange={(event) => handleReservationChange('confirmationHeadline', event.target.value)}
                    data-testid="reservation-confirmation-headline-input"
                  />
                </label>
                <label>
                  Confirmation subtext
                  <input
                    value={reservationDraft.confirmationSubtext}
                    onChange={(event) => handleReservationChange('confirmationSubtext', event.target.value)}
                    data-testid="reservation-confirmation-subtext-input"
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
                <div key={tier.id} className="admin-config__tier" data-testid={`reservation-tier-${tier.id}`}>
                  <div className="admin-config__tier-header">
                    <h4>{tier.label || `Tier ${index + 1}`}</h4>
                    <button
                      type="button"
                      className="admin-config__remove"
                      onClick={() => handleRemoveTier(index)}
                      disabled={reservationDraft.tableTiers.length <= 1}
                      data-testid={`reservation-tier-${tier.id}-remove`}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="admin-config__grid">
                    <label>
                      Label
                      <input
                        value={tier.label}
                        onChange={(event) => handleTierChange(index, 'label', event.target.value)}
                        data-testid={`reservation-tier-${tier.id}-label-input`}
                      />
                    </label>
                    <label>
                      Capacity note
                      <input
                        value={tier.capacity}
                        onChange={(event) => handleTierChange(index, 'capacity', event.target.value)}
                        data-testid={`reservation-tier-${tier.id}-capacity-input`}
                      />
                    </label>
                  </div>
                  <label>
                    Description
                    <textarea
                      rows={2}
                      value={tier.description}
                      onChange={(event) => handleTierChange(index, 'description', event.target.value)}
                      data-testid={`reservation-tier-${tier.id}-description-input`}
                    />
                  </label>
                  <div className="admin-config__grid">
                    <label>
                      Price label
                      <input
                        value={tier.price}
                        onChange={(event) => handleTierChange(index, 'price', event.target.value)}
                        data-testid={`reservation-tier-${tier.id}-price-input`}
                      />
                    </label>
                    <label>
                      Total sections
                      <input
                        type="number"
                        min={0}
                        value={tier.total}
                        onChange={(event) => handleTierChange(index, 'total', event.target.value)}
                        data-testid={`reservation-tier-${tier.id}-total-input`}
                      />
                    </label>
                    <label>
                      Reserved sections
                      <input
                        type="number"
                        min={0}
                        value={tier.reserved}
                        onChange={(event) => handleTierChange(index, 'reserved', event.target.value)}
                        data-testid={`reservation-tier-${tier.id}-reserved-input`}
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
              <button
                type="button"
                className="admin-config__add"
                onClick={handleAddTier}
                data-testid="reservation-add-tier"
              >
                Add section tier
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

        {activeTab === 'footer' && (
          <form className="admin-config__form" onSubmit={handleSave}>
            <fieldset>
              <legend>Social media links</legend>
              <p className="admin-config__hint">
                Configure social media links that appear in the footer. Choose an icon, add a label, and provide the full URL.
              </p>
              {footerDraft.socials.map((social, index) => (
                <div key={`social-${index}`} className="admin-config__tier">
                  <div className="admin-config__tier-header">
                    <h4>{social.name || `Link ${index + 1}`}</h4>
                    <button
                      type="button"
                      className="admin-config__remove"
                      onClick={() => handleRemoveSocial(index)}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="admin-config__grid">
                    <label>
                      Name/Label
                      <input
                        value={social.name}
                        onChange={(event) => handleSocialChange(index, 'name', event.target.value)}
                        placeholder="Instagram"
                      />
                    </label>
                    <label>
                      Icon
                      <select
                        value={social.icon}
                        onChange={(event) => handleSocialChange(index, 'icon', event.target.value)}
                      >
                        <option value="instagram">Instagram</option>
                        <option value="tiktok">TikTok</option>
                        <option value="facebook">Facebook</option>
                        <option value="x">X</option>
                      </select>
                    </label>
                  </div>
                  <label>
                    URL
                    <input
                      value={social.url}
                      onChange={(event) => handleSocialChange(index, 'url', event.target.value)}
                      placeholder="https://"
                    />
                  </label>
                </div>
              ))}
              <button
                type="button"
                className="admin-config__add"
                onClick={handleAddSocial}
              >
                Add social link
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
