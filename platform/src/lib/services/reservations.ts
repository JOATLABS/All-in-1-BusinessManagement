import { calculateDepositDue, calculateOccupancy, Event } from "@/lib/data/events";

export interface ReservationRequest {
  event: Event;
  tablesRequested: number;
}

export interface ReservationQuote {
  eventId: string;
  tablesApproved: number;
  depositDue: number;
  occupancyAfterReservation: number;
  waitlisted: boolean;
}

export function createReservationQuote({
  event,
  tablesRequested,
}: ReservationRequest): ReservationQuote {
  const safeTables = Math.max(1, Math.floor(tablesRequested));
  const available = Math.max(event.remainingTables, 0);
  const tablesApproved = Math.min(safeTables, available);

  const occupancyAfterReservation = calculateOccupancy({
    ...event,
    remainingTables: Math.max(available - tablesApproved, 0),
  });

  const depositDue = calculateDepositDue(event, tablesApproved);

  return {
    eventId: event.id,
    tablesApproved,
    depositDue,
    occupancyAfterReservation,
    waitlisted: safeTables > available,
  };
}

export function hasCriticalAvailability(event: Event): boolean {
  return event.remainingTables / event.totalTables <= 0.25;
}
