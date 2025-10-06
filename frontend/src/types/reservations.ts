export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled';

export interface ReservationAvailabilityTier {
  tierId: string;
  total: number;
  baseReserved: number;
  confirmed: number;
  available: number;
}

export interface ReservationAvailabilitySummary {
  total: number;
  baseReserved: number;
  confirmed: number;
  available: number;
}

export interface ReservationAvailabilityResponse {
  tiers: ReservationAvailabilityTier[];
  summary: ReservationAvailabilitySummary;
}

export interface CreateReservationPayload {
  tierId: string;
  guestName: string;
  email: string;
  phone?: string;
  guestCount: number;
  paymentIntentId?: string;
}

export interface CreateReservationResponse {
  reservation: {
    id: string;
    confirmationCode: string;
    status: 'confirmed';
  };
  availability: ReservationAvailabilityResponse;
}

export interface AdminReservation {
  id: string;
  tierId: string;
  tierLabel: string;
  tierPrice: string;
  tierCapacity: string;
  guestName: string;
  email: string;
  phone?: string | null;
  guestCount: number;
  paymentIntentId?: string | null;
  status: ReservationStatus;
  confirmationCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminReservationListResponse {
  reservations: AdminReservation[];
}

export interface AdminReservationUpdateResponse {
  reservation: AdminReservation;
}
