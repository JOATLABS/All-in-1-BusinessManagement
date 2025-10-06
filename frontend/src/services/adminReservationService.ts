import { apiFetch } from './apiClient';
import type {
  AdminReservationListResponse,
  AdminReservationUpdateResponse,
  ReservationStatus
} from '../types/reservations';

export interface AdminReservationQuery {
  status?: ReservationStatus;
  limit?: number;
}

const buildQueryString = (params: AdminReservationQuery): string => {
  const searchParams = new URLSearchParams();

  if (params.status) {
    searchParams.set('status', params.status);
  }

  if (typeof params.limit === 'number' && Number.isFinite(params.limit)) {
    searchParams.set('limit', String(params.limit));
  }

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

export const fetchAdminReservations = async (
  token: string,
  params: AdminReservationQuery = {}
): Promise<AdminReservationListResponse> => {
  const query = buildQueryString(params);
  return apiFetch<AdminReservationListResponse>(`/api/v1/admin/reservations${query}`, {
    token
  });
};

export const updateAdminReservationStatus = async (
  token: string,
  id: string,
  status: ReservationStatus
): Promise<AdminReservationUpdateResponse> =>
  apiFetch<AdminReservationUpdateResponse, { status: ReservationStatus }>(
    `/api/v1/admin/reservations/${id}`,
    {
      method: 'PATCH',
      token,
      body: { status }
    }
  );
