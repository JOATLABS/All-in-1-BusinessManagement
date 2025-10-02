import { Event, EventCategory } from "@/lib/data/events";

export type TicketFilter = "all" | "ticketed" | "host";
export type DateFilter = "all" | "thisWeekend" | "next30Days";
export type CategoryFilter = "all" | EventCategory;

export interface EventFilterState {
  category: CategoryFilter;
  ticket: TicketFilter;
  date: DateFilter;
}

export const defaultEventFilters: EventFilterState = {
  category: "all",
  ticket: "all",
  date: "all",
};

export function filterEvents(events: Event[], filters: EventFilterState): Event[] {
  return events.filter((event) => {
    if (filters.category !== "all" && event.category !== filters.category) {
      return false;
    }

    if (filters.ticket === "ticketed" && !event.ticketed) {
      return false;
    }

    if (filters.ticket === "host" && event.ticketed) {
      return false;
    }

    if (filters.date !== "all") {
      const eventStart = new Date(event.start);
      const now = new Date();

      if (filters.date === "thisWeekend") {
        const day = now.getDay();
        const friday = new Date(now);
        friday.setHours(0, 0, 0, 0);

        if (day === 0) {
          friday.setDate(friday.getDate() - 2); // Sunday -> previous Friday
        } else if (day >= 5) {
          friday.setDate(friday.getDate() - (day - 5));
        } else {
          const distanceToFriday = 5 - day;
          friday.setDate(friday.getDate() + distanceToFriday);
        }

        const monday = new Date(friday);
        monday.setDate(friday.getDate() + 3);

        if (eventStart < friday || eventStart >= monday) {
          return false;
        }
      }

      if (filters.date === "next30Days") {
        const horizon = new Date(now);
        horizon.setDate(now.getDate() + 30);
        if (eventStart > horizon) {
          return false;
        }
      }
    }

    return true;
  });
}

export function getAvailableCategories(events: Event[]): CategoryFilter[] {
  const categories = new Set<CategoryFilter>(["all"]);
  events.forEach((event) => categories.add(event.category));
  return Array.from(categories);
}

export function getAvailableTicketFilters(events: Event[]): TicketFilter[] {
  const values: TicketFilter[] = ["all"];
  const hasTicketed = events.some((event) => event.ticketed);
  const hasHost = events.some((event) => !event.ticketed);
  if (hasTicketed) {
    values.push("ticketed");
  }
  if (hasHost) {
    values.push("host");
  }
  return values;
}
