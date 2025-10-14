import { FormEvent, useEffect, useState } from 'react';
import type { Event, CreateEventData, UpdateEventData } from '../../services/eventsService';
import { MediaUploadModal } from '../../components/MediaUploadModal';
import { MediaLibraryModal } from '../../components/MediaLibraryModal';
import type { BackgroundImage } from '../../types/content';

interface EventFormModalProps {
  event?: Event | null;
  onClose: () => void;
  onSave: (eventData: CreateEventData | UpdateEventData) => Promise<void>;
}

const formatDateTimeLocal = (value: string): string => {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';

  const pad = (num: number) => num.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

export const EventFormModal = ({ event, onClose, onSave }: EventFormModalProps) => {
  const [title, setTitle] = useState(event?.title || '');
  const [slug, setSlug] = useState(event?.slug || '');
  const [description, setDescription] = useState(event?.description || '');
  const [startsAt, setStartsAt] = useState(event ? formatDateTimeLocal(event.startsAt) : '');
  const [endsAt, setEndsAt] = useState(event ? formatDateTimeLocal(event.endsAt) : '');
  const [isFreeEntry, setIsFreeEntry] = useState(event?.isFreeEntry ?? true);
  const [requiresRsvp, setRequiresRsvp] = useState(event?.requiresRsvp ?? false);
  const [isFeatured, setIsFeatured] = useState(event?.isFeatured ?? false);
  const [capacity, setCapacity] = useState(event?.capacity?.toString() || '');
  const [flyerUrl, setFlyerUrl] = useState(event?.flyerUrl || '');
  const [ticketUrl, setTicketUrl] = useState(event?.ticketUrl || '');
  const [autoSlug, setAutoSlug] = useState(!event);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [libraryModalOpen, setLibraryModalOpen] = useState(false);

  useEffect(() => {
    if (autoSlug && title) {
      setSlug(generateSlug(title));
    }
  }, [title, autoSlug]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!slug.trim()) {
      setError('Slug is required');
      return;
    }

    if (!startsAt) {
      setError('Start date/time is required');
      return;
    }

    if (!endsAt) {
      setError('End date/time is required');
      return;
    }

    const startDate = new Date(startsAt);
    const endDate = new Date(endsAt);

    if (endDate <= startDate) {
      setError('End date must be after start date');
      return;
    }

    setIsSaving(true);

    const eventData: CreateEventData | UpdateEventData = {
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim() || undefined,
      startsAt: startDate.toISOString(),
      endsAt: endDate.toISOString(),
      isFreeEntry,
      requiresRsvp,
      isFeatured,
      capacity: capacity ? parseInt(capacity, 10) : undefined,
      flyerUrl: flyerUrl.trim() || undefined,
      ticketUrl: ticketUrl.trim() || undefined
    };

    try {
      await onSave(eventData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save event');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleUploadSuccess = (media: BackgroundImage) => {
    setFlyerUrl(media.src);
    setUploadModalOpen(false);
  };

  const handleLibrarySelect = (media: BackgroundImage) => {
    setFlyerUrl(media.src);
    setLibraryModalOpen(false);
  };

  const handleRemoveFlyer = () => {
    setFlyerUrl('');
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-panel" role="dialog" aria-labelledby="event-form-title">
        <header className="modal-header">
          <h2 id="event-form-title">{event ? 'Edit Event' : 'Create Event'}</h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </header>

        <form className="admin-config__form" onSubmit={handleSubmit}>
          <fieldset>
            <legend>Event details</legend>

            <label>
              Title *
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summer Night Party"
                required
              />
            </label>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <label style={{ flex: 1 }}>
                Slug *
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setAutoSlug(false);
                  }}
                  placeholder="summer-night-party"
                  required
                />
                <span className="admin-config__hint">URL-friendly identifier</span>
              </label>
              {!event && (
                <label className="admin-config__toggle" style={{ marginTop: '1.5rem' }}>
                  <input
                    type="checkbox"
                    checked={autoSlug}
                    onChange={(e) => setAutoSlug(e.target.checked)}
                  />
                  Auto-generate
                </label>
              )}
            </div>

            <label>
              Description
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Join us for an unforgettable night..."
              />
            </label>
          </fieldset>

          <fieldset>
            <legend>Schedule</legend>

            <div className="admin-config__grid">
              <label>
                Starts at *
                <input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  required
                />
              </label>

              <label>
                Ends at *
                <input
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  required
                />
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend>Entry settings</legend>

            <label className="admin-config__toggle">
              <input
                type="checkbox"
                checked={isFreeEntry}
                onChange={(e) => setIsFreeEntry(e.target.checked)}
              />
              Free entry
            </label>

            <label className="admin-config__toggle">
              <input
                type="checkbox"
                checked={requiresRsvp}
                onChange={(e) => setRequiresRsvp(e.target.checked)}
              />
              Requires RSVP
            </label>

            <label className="admin-config__toggle">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
              />
              Featured event
            </label>

            <label>
              Capacity
              <input
                type="number"
                min="0"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="Leave empty for unlimited"
              />
              <span className="admin-config__hint">Maximum number of attendees (optional)</span>
            </label>
          </fieldset>

          <fieldset>
            <legend>Media & tickets</legend>

            <div>
              <label>
                Flyer URL
                <input
                  type="url"
                  value={flyerUrl}
                  onChange={(e) => setFlyerUrl(e.target.value)}
                  placeholder="https://example.com/flyer.jpg"
                />
              </label>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="admin-config__add"
                  onClick={() => setUploadModalOpen(true)}
                >
                  Upload Flyer
                </button>
                <button
                  type="button"
                  className="admin-config__add"
                  onClick={() => setLibraryModalOpen(true)}
                >
                  Browse Library
                </button>
              </div>

              {flyerUrl && (
                <div style={{ marginTop: '1rem', position: 'relative', display: 'inline-block' }}>
                  <img
                    src={flyerUrl}
                    alt="Event flyer preview"
                    style={{
                      maxWidth: '200px',
                      height: 'auto',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '0.5rem'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveFlyer}
                    style={{
                      position: 'absolute',
                      top: '0.5rem',
                      right: '0.5rem',
                      background: 'rgba(0, 0, 0, 0.7)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '2rem',
                      height: '2rem',
                      cursor: 'pointer',
                      fontSize: '1.2rem'
                    }}
                    title="Remove flyer"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            <label>
              Ticket URL
              <input
                type="url"
                value={ticketUrl}
                onChange={(e) => setTicketUrl(e.target.value)}
                placeholder="https://example.com/tickets"
              />
              <span className="admin-config__hint">Link to external ticketing page</span>
            </label>
          </fieldset>

          {error && (
            <div className="admin-config__error" role="alert">
              {error}
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="modal-button modal-button--secondary"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-config__save"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>

      <MediaUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        folder="events"
      />

      <MediaLibraryModal
        isOpen={libraryModalOpen}
        onClose={() => setLibraryModalOpen(false)}
        onSelectMedia={handleLibrarySelect}
        folder="events"
      />
    </div>
  );
};
