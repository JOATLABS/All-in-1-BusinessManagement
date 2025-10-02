import { NextRequest, NextResponse } from "next/server";
import {
  getUpcomingEvents,
  calculateOccupancy,
  events,
  isEventCategory,
} from "@/lib/data/events";
import { hasCriticalAvailability } from "@/lib/services/reservations";
import {
  defaultEventFilters,
  filterEvents,
  EventFilterState,
} from "@/lib/services/events";

export const revalidate = 60; // refresh once per minute for near real-time availability

function parseFilters(request: NextRequest): EventFilterState {
  const params = request.nextUrl.searchParams;
  const filters: EventFilterState = {
    ...defaultEventFilters,
  };

  const category = params.get("category");
  if (category && category !== "all" && isEventCategory(category)) {
    filters.category = category;
  }

  const ticket = params.get("ticket");
  if (ticket === "ticketed" || ticket === "host") {
    filters.ticket = ticket;
  }

  const date = params.get("date");
  if (date === "thisWeekend" || date === "next30Days") {
    filters.date = date;
  }

  return filters;
}

export async function GET(request: NextRequest) {
  const upcoming = filterEvents(getUpcomingEvents(), parseFilters(request)).map((event) => ({
    ...event,
    occupancy: calculateOccupancy(event),
    critical: hasCriticalAvailability(event),
  }));

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    events: upcoming,
    total: events.length,
  });
}
