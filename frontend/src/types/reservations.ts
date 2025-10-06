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
