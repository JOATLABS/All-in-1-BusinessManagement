import { useEffect, useState } from 'react';
import { fetchEvents, createRSVP, type Event, type RSVPResponse } from '../services/eventsService';

export const EventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [rsvpSuccess, setRsvpSuccess] = useState<RSVPResponse | null>(null);

  // RSVP form state
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [rsvpError, setRsvpError] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const { events: fetchedEvents } = await fetchEvents();
      setEvents(fetchedEvents);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleRSVPClick = (event: Event) => {
    setSelectedEvent(event);
    setRsvpSuccess(null);
    setRsvpError(null);
    setGuestName('');
    setGuestEmail('');
    setGuestPhone('');
  };

  const handleRSVPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEvent) return;

    try {
      setRsvpLoading(true);
      setRsvpError(null);

      const response = await createRSVP(selectedEvent.id, {
        guestName,
        guestEmail,
        guestPhone: guestPhone || undefined
      });

      setRsvpSuccess(response);
    } catch (err) {
      setRsvpError(err instanceof Error ? err.message : 'Failed to create RSVP');
    } finally {
      setRsvpLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedEvent(null);
    setRsvpSuccess(null);
    setRsvpError(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="events-page">
        <div className="events-container">
          <h1>Loading events...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="events-page">
        <div className="events-container">
          <h1>Error loading events</h1>
          <p>{error}</p>
          <button onClick={loadEvents}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="events-page">
      <div className="events-container">
        <header className="events-header">
          <h1>Upcoming Events</h1>
          <p>Experience the best Afrobeats music at Rhythm Plus Root</p>
        </header>

        {events.length === 0 ? (
          <div className="events-empty">
            <p>No upcoming events at the moment. Check back soon!</p>
          </div>
        ) : (
          <div className="events-grid">
            {events.map((event) => (
              <article key={event.id} className="event-card">
                {event.flyerUrl && (
                  <div className="event-card__image">
                    <img src={event.flyerUrl} alt={event.title} />
                  </div>
                )}

                <div className="event-card__content">
                  {event.isFeatured && (
                    <span className="event-card__badge">Featured</span>
                  )}

                  <h2 className="event-card__title">{event.title}</h2>

                  <p className="event-card__date">
                    {formatDate(event.startsAt)}
                  </p>

                  {event.description && (
                    <p className="event-card__description">{event.description}</p>
                  )}

                  <div className="event-card__footer">
                    {event.isFreeEntry ? (
                      <span className="event-card__price">Free Entry</span>
                    ) : (
                      <span className="event-card__price">Paid Event</span>
                    )}

                    {event.capacity && (
                      <span className="event-card__capacity">
                        Capacity: {event.capacity}
                      </span>
                    )}
                  </div>

                  {event.isFreeEntry && event.requiresRsvp ? (
                    <button
                      className="event-card__cta"
                      onClick={() => handleRSVPClick(event)}
                    >
                      RSVP Free
                    </button>
                  ) : event.ticketUrl ? (
                    <a
                      href={event.ticketUrl}
                      className="event-card__cta"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Buy Tickets
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* RSVP Modal */}
      {selectedEvent && !rsvpSuccess && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal__close" onClick={closeModal}>×</button>

            <h2 className="modal__title">RSVP for {selectedEvent.title}</h2>
            <p className="modal__subtitle">{formatDate(selectedEvent.startsAt)}</p>

            {rsvpError && (
              <div className="modal__error">
                {rsvpError}
              </div>
            )}

            <form onSubmit={handleRSVPSubmit} className="rsvp-form">
              <div className="rsvp-form__field">
                <label htmlFor="guestName">Full Name *</label>
                <input
                  id="guestName"
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  required
                  disabled={rsvpLoading}
                  placeholder="Your full name"
                />
              </div>

              <div className="rsvp-form__field">
                <label htmlFor="guestEmail">Email *</label>
                <input
                  id="guestEmail"
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  required
                  disabled={rsvpLoading}
                  placeholder="your@email.com"
                />
              </div>

              <div className="rsvp-form__field">
                <label htmlFor="guestPhone">Phone (optional)</label>
                <input
                  id="guestPhone"
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  disabled={rsvpLoading}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <button
                type="submit"
                className="rsvp-form__submit"
                disabled={rsvpLoading}
              >
                {rsvpLoading ? 'Submitting...' : 'Confirm RSVP'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal with QR Code */}
      {rsvpSuccess && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal--success" onClick={(e) => e.stopPropagation()}>
            <button className="modal__close" onClick={closeModal}>×</button>

            <div className="rsvp-success">
              <h2 className="rsvp-success__title">🎉 You're on the list!</h2>
              <p className="rsvp-success__message">{rsvpSuccess.message}</p>

              <div className="rsvp-success__event">
                <h3>{rsvpSuccess.event.title}</h3>
                <p>{formatDate(rsvpSuccess.event.startsAt)}</p>
              </div>

              {rsvpSuccess.ticket.qrCodeImageUrl && (
                <div className="rsvp-success__qr">
                  <p className="rsvp-success__qr-label">Your Entry QR Code</p>
                  <img
                    src={rsvpSuccess.ticket.qrCodeImageUrl}
                    alt="QR Code"
                    className="rsvp-success__qr-image"
                  />
                  <p className="rsvp-success__qr-code">{rsvpSuccess.ticket.qrCode}</p>
                  <p className="rsvp-success__qr-hint">
                    Show this QR code at the door. We've also sent it to your email.
                  </p>
                </div>
              )}

              <button className="rsvp-success__done" onClick={closeModal}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
