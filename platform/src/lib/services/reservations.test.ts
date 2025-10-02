import { describe, expect, it } from "vitest";
import { events, calculateDepositDue } from "@/lib/data/events";
import { createReservationQuote, hasCriticalAvailability } from "./reservations";

const sampleEvent = {
  ...events[0],
  remainingTables: 5,
  totalTables: 20,
};

describe("createReservationQuote", () => {
  it("caps approved tables to availability", () => {
    const quote = createReservationQuote({ event: sampleEvent, tablesRequested: 10 });
    expect(quote.tablesApproved).toBe(5);
    expect(quote.waitlisted).toBe(true);
  });

  it("calculates occupancy after reservation", () => {
    const quote = createReservationQuote({ event: sampleEvent, tablesRequested: 2 });
    expect(quote.occupancyAfterReservation).toBeGreaterThan(0);
    expect(quote.occupancyAfterReservation).toBeLessThanOrEqual(100);
  });

  it("calculates deposit using shared helper", () => {
    const quote = createReservationQuote({ event: sampleEvent, tablesRequested: 2 });
    expect(quote.depositDue).toBe(calculateDepositDue(sampleEvent, quote.tablesApproved));
  });
});

describe("hasCriticalAvailability", () => {
  it("flags events below 25% remaining", () => {
    expect(hasCriticalAvailability({ ...sampleEvent, remainingTables: 2 })).toBe(true);
  });

  it("does not flag events above threshold", () => {
    expect(hasCriticalAvailability({ ...sampleEvent, remainingTables: 10 })).toBe(false);
  });
});
