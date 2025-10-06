import { apiFetch } from './apiClient';
import type {
  CreateReservationPayload,
  CreateReservationResponse,
  ReservationAvailabilityResponse
} from '../types/reservations';

export const fetchReservationAvailability = async (): Promise<ReservationAvailabilityResponse> =>
  apiFetch<ReservationAvailabilityResponse>('/api/v1/reservations/availability');

export const createReservation = async (
  payload: CreateReservationPayload
): Promise<CreateReservationResponse> =>
  apiFetch<CreateReservationResponse, CreateReservationPayload>('/api/v1/reservations', {
    method: 'POST',
    body: payload
  });
