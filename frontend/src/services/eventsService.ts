import { config } from '../config/api';

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
  isFreeEntry: boolean;
  requiresRsvp: boolean;
  capacity: number | null;
  isFeatured: boolean;
  flyerUrl: string | null;
  ticketUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  eventId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string | null;
  ticketType: string;
  qrCode: string;
  qrCodeImageUrl: string | null;
  status: string;
  createdAt: string;
}

export interface RSVPRequest {
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
}

export interface RSVPResponse {
  ticket: Ticket;
  event: Event;
  message: string;
}

/**
 * Fetch all upcoming events
 * Single-tenant: no club_id needed in URL
 */
export const fetchEvents = async (): Promise<{ events: Event[] }> => {
  const response = await fetch(`${config.apiBaseUrl}/api/v1/events`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }

  return response.json();
};

/**
 * Get event by slug
 * Single-tenant: direct query, no tenant context
 */
export const fetchEventBySlug = async (slug: string): Promise<{ event: Event }> => {
  const response = await fetch(`${config.apiBaseUrl}/api/v1/events/${slug}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Event not found');
  }

  return response.json();
};

/**
 * Create free RSVP for event
 * Single-tenant: all RSVPs belong to the one venue
 */
export const createRSVP = async (
  eventId: string,
  rsvpData: RSVPRequest
): Promise<RSVPResponse> => {
  const response = await fetch(`${config.apiBaseUrl}/api/v1/events/${eventId}/rsvp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(rsvpData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create RSVP');
  }

  return response.json();
};
