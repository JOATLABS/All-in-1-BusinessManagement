import { describe, expect, it } from "vitest";
import { events } from "@/lib/data/events";
import { getEventPackages } from "@/lib/data/reservationPricing";
import { createReservationQuote, hasCriticalAvailability } from "./reservations";

const sampleEvent = {
  ...events[0],
  remainingTables: 5,
  totalTables: 20,
};

describe("createReservationQuote", () => {
  const samplePackage = getEventPackages(sampleEvent)[0];

  it("caps approved tables to availability", () => {
    const quote = createReservationQuote({
      event: sampleEvent,
      tablesRequested: 10,
      packageId: samplePackage.id,
    });
    expect(quote.tablesApproved).toBe(5);
    expect(quote.waitlisted).toBe(true);
  });

  it("calculates occupancy after reservation", () => {
    const quote = createReservationQuote({
      event: sampleEvent,
      tablesRequested: 2,
      packageId: samplePackage.id,
    });
    expect(quote.occupancyAfterReservation).toBeGreaterThan(0);
    expect(quote.occupancyAfterReservation).toBeLessThanOrEqual(100);
  });

  it("returns package level pricing", () => {
    const quote = createReservationQuote({
      event: sampleEvent,
      tablesRequested: 2,
      packageId: samplePackage.id,
    });

    expect(quote.packageId).toBe(samplePackage.id);
    expect(quote.depositPerTable).toBeCloseTo(samplePackage.depositPerTable, 2);
    expect(quote.minimumSpendPerTable).toBeCloseTo(samplePackage.minimumSpendPerTable, 2);
    expect(quote.depositDue).toBeCloseTo(samplePackage.depositPerTable * quote.tablesApproved, 2);
  });

  it("throws when a package is not available", () => {
    expect(() =>
      createReservationQuote({
        event: sampleEvent,
        tablesRequested: 2,
        packageId: "unknown",
      })
    ).toThrowError(/Selected package is not available/);
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
