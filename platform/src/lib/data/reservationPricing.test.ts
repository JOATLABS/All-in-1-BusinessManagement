import { describe, expect, it } from "vitest";
import { events } from "@/lib/data/events";
import { getEventPackages, getReservationPackages } from "./reservationPricing";

describe("reservationPricing", () => {
  it("applies weekend premium multipliers", () => {
    const baseline = getReservationPackages()[0];
    const event = events.find((item) => item.id === "sonic-moon-0405");

    expect(event).toBeTruthy();
    if (!event) return;

    const pricedPackage = getEventPackages(event)[0];

    expect(pricedPackage.minimumSpendPerTable).toBeGreaterThan(baseline.baseSpend);
    expect(pricedPackage.depositRate).toBeGreaterThanOrEqual(baseline.defaultDepositRate);
  });

  it("offers community and day discounts", () => {
    const communityEvent = events.find((item) => item.id === "writers-round-0420");
    const dayEvent = events.find((item) => item.id === "lagos-sunrise-0411");

    expect(communityEvent).toBeTruthy();
    expect(dayEvent).toBeTruthy();
    if (!communityEvent || !dayEvent) return;

    const [communityPackage] = getEventPackages(communityEvent);
    const [dayPackage] = getEventPackages(dayEvent);
    const baseline = getReservationPackages()[0];

    expect(communityPackage.minimumSpendPerTable).toBeLessThan(baseline.baseSpend);
    expect(dayPackage.minimumSpendPerTable).toBeLessThanOrEqual(baseline.baseSpend * 1.1);
    expect(communityPackage.depositRate).toBeLessThan(dayPackage.depositRate);
    expect(dayPackage.depositRate).toBeLessThan(baseline.defaultDepositRate);
  });
});
