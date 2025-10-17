import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { RoleGuard } from '../../auth/RoleGuard';
import { EventFormModal } from './EventFormModal';
import {
  fetchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  type Event,
  type CreateEventData,
  type UpdateEventData
} from '../../services/eventsService';

const timestampFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit'
});

const formatTimestamp = (value: string) => {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return '—';
  }
  return timestampFormatter.format(date);
};

const getEventStatus = (event: Event): 'upcoming' | 'ongoing' | 'past' => {
  const now = new Date();
  const start = new Date(event.startsAt);
  const end = new Date(event.endsAt);

  if (now < start) return 'upcoming';
  if (now > end) return 'past';
  return 'ongoing';
};

export const AdminEventsPage = () => {
  const { token } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchEvents();
      // Sort by date: upcoming first, then ongoing, then past
      const sorted = response.events.sort((a, b) => {
        const aStatus = getEventStatus(a);
        const bStatus = getEventStatus(b);

        const statusOrder = { upcoming: 0, ongoing: 1, past: 2 };
        if (statusOrder[aStatus] !== statusOrder[bStatus]) {
          return statusOrder[aStatus] - statusOrder[bStatus];
        }

        return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
      });
      setEvents(sorted);
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : 'Unable to load events at this time.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  const handleCreateClick = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (event: Event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const handleSave = async (eventData: CreateEventData | UpdateEventData) => {
    if (!token) {
      throw new Error('Authentication required');
    }

    if (editingEvent) {
      await updateEvent(token, editingEvent.id, eventData as UpdateEventData);
    } else {
      await createEvent(token, eventData as CreateEventData);
    }

    await loadEvents();
  };

  const handleDelete = async (event: Event) => {
    if (!token) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${event.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(event.id);
    setError(null);

    try {
      await deleteEvent(token, event.id);
      await loadEvents();
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : 'Failed to delete event.';
      setError(message);
    } finally {
      setDeletingId(null);
    }
  };

  if (!token) {
    return (
      <section className="admin-reservations">
        <p>You must be authenticated to manage events.</p>
      </section>
    );
  }

  return (
    <section className="admin-reservations">
      <header className="admin-reservations__header">
        <div>
          <p className="admin-reservations__eyebrow">Event Management</p>
          <h1>Events</h1>
          <p className="admin-reservations__intro">
            Create, edit, and manage all nightclub events. Control visibility, ticketing, and scheduling for your venue.
          </p>
        </div>
        <RoleGuard roles={['superadmin', 'admin']}>
          <button
            type="button"
            className="admin-config__save"
            onClick={handleCreateClick}
            style={{ whiteSpace: 'nowrap' }}
          >
            Create Event
          </button>
        </RoleGuard>
      </header>

      {error && (
        <div className="admin-reservations__error" role="alert">
          {error}
        </div>
      )}

      <div className="admin-reservations__table">
        <table>
          <thead>
            <tr>
              <th scope="col">Event</th>
              <th scope="col">Schedule</th>
              <th scope="col">Status</th>
              <th scope="col">Entry</th>
              <th scope="col">Featured</th>
              <th scope="col" className="admin-reservations__actions-col">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {!isLoading && events.length === 0 && (
              <tr>
                <td colSpan={6} className="admin-reservations__empty">
                  No events created yet. Click "Create Event" to add your first event.
                </td>
              </tr>
            )}

            {isLoading && (
              <tr>
                <td colSpan={6} className="admin-reservations__loading">
                  Loading events...
                </td>
              </tr>
            )}

            {!isLoading &&
              events.map((event) => {
                const status = getEventStatus(event);
                return (
                  <tr key={event.id}>
                    <td>
                      <div className="admin-reservations__section">
                        <span className="admin-reservations__section-label">
                          {event.title}
                        </span>
                        {event.description && (
                          <span className="admin-reservations__section-meta">
                            {event.description.substring(0, 60)}
                            {event.description.length > 60 ? '...' : ''}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="admin-reservations__guest">
                        <span style={{ fontSize: '0.85rem' }}>
                          {formatTimestamp(event.startsAt)}
                        </span>
                        <span className="admin-reservations__guest-meta">
                          to {formatTimestamp(event.endsAt)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`admin-reservations__status admin-reservations__status--${
                          status === 'upcoming' ? 'pending' : status === 'past' ? 'cancelled' : 'confirmed'
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </td>
                    <td>
                      {event.isFreeEntry ? (
                        <span>Free</span>
                      ) : (
                        <span>Paid</span>
                      )}
                      {event.requiresRsvp && (
                        <span className="admin-reservations__guest-meta"> · RSVP</span>
                      )}
                    </td>
                    <td>
                      {event.isFeatured ? (
                        <span className="admin-dashboard__badge admin-dashboard__badge--confirmed">
                          Featured
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td>
                      <RoleGuard roles={['superadmin', 'admin']} fallback={<span style={{ color: 'var(--text-muted)' }}>—</span>}>
                        <div className="admin-reservations__actions">
                          <button
                            type="button"
                            onClick={() => handleEditClick(event)}
                            disabled={deletingId === event.id}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(event)}
                            disabled={deletingId === event.id}
                            style={{
                              color: '#f06a6a',
                              borderColor: 'rgba(240, 106, 106, 0.4)'
                            }}
                          >
                            {deletingId === event.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </RoleGuard>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <EventFormModal
          event={editingEvent}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </section>
  );
};
