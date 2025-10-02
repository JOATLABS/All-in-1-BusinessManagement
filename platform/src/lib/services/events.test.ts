import { afterAll, describe, expect, it, vi } from "vitest";
import { events } from "@/lib/data/events";
import {
  defaultEventFilters,
  filterEvents,
  getAvailableCategories,
  getAvailableTicketFilters,
} from "@/lib/services/events";

vi.useFakeTimers();

afterAll(() => {
  vi.useRealTimers();
});

describe("filterEvents", () => {
  it("returns all events with default filters", () => {
    const result = filterEvents(events, defaultEventFilters);
    expect(result).toHaveLength(events.length);
  });

  it("filters by category", () => {
    const result = filterEvents(events, {
      ...defaultEventFilters,
      category: "night",
    });
    expect(result.every((event) => event.category === "night")).toBe(true);
  });

  it("filters by ticket type", () => {
    const result = filterEvents(events, {
      ...defaultEventFilters,
      ticket: "ticketed",
    });
    expect(result.every((event) => event.ticketed)).toBe(true);
  });

  it("filters by weekend window", () => {
    const friday = new Date("2025-04-04T12:00:00-05:00");
    vi.setSystemTime(friday);

    const result = filterEvents(events, {
      ...defaultEventFilters,
      date: "thisWeekend",
    });

    expect(result.every((event) => {
      const start = new Date(event.start);
      return (
        start >= new Date("2025-04-04T00:00:00-05:00") &&
        start < new Date("2025-04-07T00:00:00-05:00")
      );
    })).toBe(true);
  });
});

describe("available filters", () => {
  it("includes all categories plus all option", () => {
    const categories = getAvailableCategories(events);
    expect(categories).toContain("all");
    expect(categories).toEqual(expect.arrayContaining(["night", "day", "community", "launch"]));
  });

  it("includes ticket options that exist", () => {
    const tickets = getAvailableTicketFilters(events);
    expect(tickets).toContain("all");
    expect(tickets).toContain("ticketed");
    expect(tickets).toContain("host");
  });
});
