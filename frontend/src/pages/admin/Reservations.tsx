import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import {
  fetchAdminReservations,
  updateAdminReservationStatus,
  type AdminReservationQuery
} from '../../services/adminReservationService';
import type { AdminReservation, ReservationStatus } from '../../types/reservations';

const timestampFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit'
});

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

const formatTimestamp = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return timestampFormatter.format(date);
};

const parsePrice = (value: string): number => {
  const numeric = Number.parseFloat(value.replace(/[^0-9.]/g, ''));
  return Number.isFinite(numeric) ? numeric : 0;
};

const statusLabels: Record<ReservationStatus, string> = {
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  pending: 'Pending approval'
};

type StatusFilter = ReservationStatus | 'all';

const statusOptions: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'All reservations' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'pending', label: 'Pending' },
  { value: 'cancelled', label: 'Cancelled' }
];

const MAX_LIMIT = 200;

export const Reservations = () => {
  const { token } = useAuth();
  const [reservations, setReservations] = useState<AdminReservation[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadReservations = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setError(null);

    const query: AdminReservationQuery = { limit: MAX_LIMIT };
    if (statusFilter !== 'all') {
      query.status = statusFilter;
    }

    try {
      const response = await fetchAdminReservations(token, query);
      setReservations(response.reservations);
      setLastUpdated(new Date());
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : 'Unable to load reservations at this time.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, token]);

  useEffect(() => {
    void loadReservations();
  }, [loadReservations]);

  const metrics = useMemo(() => {
    let confirmed = 0;
    let pending = 0;
    let cancelled = 0;
    let guests = 0;
    let revenue = 0;

    for (const reservation of reservations) {
      if (reservation.status === 'confirmed') {
        confirmed += 1;
        guests += reservation.guestCount;
        revenue += parsePrice(reservation.tierPrice);
      } else if (reservation.status === 'pending') {
        pending += 1;
        guests += reservation.guestCount;
      } else if (reservation.status === 'cancelled') {
        cancelled += 1;
      }
    }

    return {
      confirmed,
      pending,
      cancelled,
      guests,
      revenue,
      tracked: reservations.length
    };
  }, [reservations]);

  const handleStatusFilterChange = (next: StatusFilter) => {
    setStatusFilter(next);
  };

  const handleRefresh = async () => {
    await loadReservations();
  };

  const handleUpdateStatus = async (reservation: AdminReservation, status: ReservationStatus) => {
    if (!token) {
      return;
    }

    setUpdatingId(reservation.id);
    setError(null);

    try {
      await updateAdminReservationStatus(token, reservation.id, status);
      await loadReservations();
    } catch (updateError) {
      const message =
        updateError instanceof Error
          ? updateError.message
          : 'Failed to update reservation status.';
      setError(message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (!token) {
    return (
      <section className="admin-reservations">
        <p>You must be authenticated to view reservations.</p>
      </section>
    );
  }

  return (
    <section className="admin-reservations" data-testid="admin-reservations">
      <header className="admin-reservations__header">
        <div>
          <p className="admin-reservations__eyebrow">VIP sections</p>
          <h1>Reservation control</h1>
          <p className="admin-reservations__intro">
            Track every paid section, release space instantly, and keep operations in sync with the live availability model.
          </p>
        </div>
        <div className="admin-reservations__toolbar">
          <label className="admin-reservations__filter" htmlFor="reservation-status-filter">
            Status
            <select
              id="reservation-status-filter"
              value={statusFilter}
              onChange={(event) => handleStatusFilterChange(event.target.value as StatusFilter)}
              data-testid="reservation-status-filter"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="admin-reservations__refresh"
            onClick={() => {
              void handleRefresh();
            }}
            disabled={isLoading}
            data-testid="reservation-refresh-button"
          >
            {isLoading ? 'Refreshing…' : 'Refresh'}
          </button>
          {lastUpdated && (
            <span className="admin-reservations__timestamp" data-testid="reservation-last-updated">
              Updated {formatTimestamp(lastUpdated.toISOString())}
            </span>
          )}
        </div>
      </header>

      <div className="admin-reservations__metrics" data-testid="reservation-metrics">
        <article className="admin-reservations__metric-card">
          <h2>Confirmed</h2>
          <p>{metrics.confirmed}</p>
          <span>{metrics.guests} guests accounted for</span>
        </article>
        <article className="admin-reservations__metric-card">
          <h2>Pending</h2>
          <p>{metrics.pending}</p>
          <span>Awaiting payment or manual review</span>
        </article>
        <article className="admin-reservations__metric-card">
          <h2>Cancelled</h2>
          <p>{metrics.cancelled}</p>
          <span>Sections released back to inventory</span>
        </article>
        <article className="admin-reservations__metric-card">
          <h2>Projected revenue</h2>
          <p>{currencyFormatter.format(metrics.revenue)}</p>
          <span>{metrics.tracked} reservations tracked</span>
        </article>
      </div>

      {error && (
        <div className="admin-reservations__error" role="alert" data-testid="reservation-error">
          {error}
        </div>
      )}

      <div className="admin-reservations__table" data-testid="reservation-table">
        <table>
          <thead>
            <tr>
              <th scope="col">Section</th>
              <th scope="col">Guest</th>
              <th scope="col">Status</th>
              <th scope="col">Party</th>
              <th scope="col">Confirmation</th>
              <th scope="col">Booked</th>
              <th scope="col" className="admin-reservations__actions-col">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {!isLoading && reservations.length === 0 && (
              <tr>
                <td colSpan={7} className="admin-reservations__empty" data-testid="reservation-empty">
                  No reservations match this filter yet.
                </td>
              </tr>
            )}

            {isLoading && (
              <tr>
                <td colSpan={7} className="admin-reservations__loading">
                  Loading reservations…
                </td>
              </tr>
            )}

            {!isLoading &&
              reservations.map((reservation) => (
                <tr key={reservation.id} data-testid={`reservation-row-${reservation.id}`}>
                  <td>
                    <div className="admin-reservations__section">
                      <span className="admin-reservations__section-label">{reservation.tierLabel}</span>
                      <span className="admin-reservations__section-meta">
                        {reservation.tierCapacity} · {reservation.tierPrice}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="admin-reservations__guest">
                      <span>{reservation.guestName}</span>
                      <span className="admin-reservations__guest-meta">
                        {reservation.email}
                        {reservation.phone ? ` · ${reservation.phone}` : ''}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`admin-reservations__status admin-reservations__status--${reservation.status}`}>
                      {statusLabels[reservation.status]}
                    </span>
                  </td>
                  <td>{reservation.guestCount}</td>
                  <td>{reservation.confirmationCode}</td>
                  <td>{formatTimestamp(reservation.createdAt)}</td>
                  <td>
                    <div className="admin-reservations__actions" data-testid={`reservation-actions-${reservation.id}`}>
                      {reservation.status === 'confirmed' && (
                        <button
                          type="button"
                          onClick={() => {
                            void handleUpdateStatus(reservation, 'cancelled');
                          }}
                          disabled={updatingId === reservation.id}
                          data-testid={`reservation-cancel-${reservation.id}`}
                        >
                          Release section
                        </button>
                      )}
                      {reservation.status === 'cancelled' && (
                        <button
                          type="button"
                          onClick={() => {
                            void handleUpdateStatus(reservation, 'confirmed');
                          }}
                          disabled={updatingId === reservation.id}
                          data-testid={`reservation-restore-${reservation.id}`}
                        >
                          Reinstate
                        </button>
                      )}
                      {reservation.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              void handleUpdateStatus(reservation, 'confirmed');
                            }}
                            disabled={updatingId === reservation.id}
                            data-testid={`reservation-approve-${reservation.id}`}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              void handleUpdateStatus(reservation, 'cancelled');
                            }}
                            disabled={updatingId === reservation.id}
                            data-testid={`reservation-decline-${reservation.id}`}
                          >
                            Decline
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
