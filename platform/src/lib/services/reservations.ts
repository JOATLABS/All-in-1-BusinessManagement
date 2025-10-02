import { calculateOccupancy, Event } from "@/lib/data/events";
import { findEventPackage } from "@/lib/data/reservationPricing";

export interface ReservationRequest {
  event: Event;
  tablesRequested: number;
  packageId: string;
}

export interface ReservationQuote {
  eventId: string;
  packageId: string;
  packageTitle: string;
  tablesApproved: number;
  depositDue: number;
  depositPerTable: number;
  minimumSpendPerTable: number;
  minimumSpendTotal: number;
  occupancyAfterReservation: number;
  waitlisted: boolean;
}

export function createReservationQuote({
  event,
  tablesRequested,
  packageId,
}: ReservationRequest): ReservationQuote {
  const packagePricing = findEventPackage(event, packageId);

  if (!packagePricing) {
    throw new Error("Selected package is not available for this event");
  }

  const safeTables = Math.max(1, Math.floor(tablesRequested));
  const available = Math.max(event.remainingTables, 0);
  const tablesApproved = Math.min(safeTables, available);

  const occupancyAfterReservation = calculateOccupancy({
    ...event,
    remainingTables: Math.max(available - tablesApproved, 0),
  });

  const depositPerTable = packagePricing.depositPerTable;
  const minimumSpendPerTable = packagePricing.minimumSpendPerTable;
  const depositDue = Number((depositPerTable * tablesApproved).toFixed(2));
  const minimumSpendTotal = Number((minimumSpendPerTable * tablesApproved).toFixed(2));

  return {
    eventId: event.id,
    packageId: packagePricing.id,
    packageTitle: packagePricing.title,
    tablesApproved,
    depositDue,
    depositPerTable,
    minimumSpendPerTable,
    minimumSpendTotal,
    occupancyAfterReservation,
    waitlisted: safeTables > available,
  };
}

export function hasCriticalAvailability(event: Event): boolean {
  return event.remainingTables / event.totalTables <= 0.25;
}
