"use client";

import { useMemo, useState } from "react";
import { Event } from "@/lib/data/events";
import {
  CategoryFilter,
  DateFilter,
  EventFilterState,
  TicketFilter,
  defaultEventFilters,
  filterEvents,
  getAvailableCategories,
  getAvailableTicketFilters,
} from "@/lib/services/events";
import { EventCard } from "@/components/events/EventCard";

interface EventsExplorerProps {
  events: Event[];
}

type FilterOption<T extends string> = {
  value: T;
  label: string;
  description?: string;
};

const dateOptions: FilterOption<DateFilter>[] = [
  { value: "all", label: "Any date" },
  { value: "thisWeekend", label: "This weekend" },
  { value: "next30Days", label: "Next 30 days" },
];

const ticketCopy: Record<TicketFilter, string> = {
  all: "All access levels",
  ticketed: "Ticketed events",
  host: "Hosted nights",
};

const categoryLabels: Record<CategoryFilter, string> = {
  all: "All vibes",
  night: "Nightlife",
  day: "Day parties",
  community: "Community",
  launch: "Launch collabs",
};

export function EventsExplorer({ events }: EventsExplorerProps) {
  const [filters, setFilters] = useState<EventFilterState>(defaultEventFilters);
  const categories = useMemo(() => getAvailableCategories(events), [events]);
  const ticketFilters = useMemo(() => getAvailableTicketFilters(events), [events]);
  const filtered = useMemo(() => filterEvents(events, filters), [events, filters]);

  const handleFilterChange = <K extends keyof EventFilterState>(key: K, value: EventFilterState[K]) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  return (
    <section className="flex flex-col gap-8">
      <div className="grid gap-6 rounded-3xl border border-white/12 bg-black/50 p-6 text-white md:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-6">
          <FilterGroup
            legend="Event vibe"
            options={categories.map((value) => ({ value, label: categoryLabels[value] }))}
            active={filters.category}
            onChange={(value) => handleFilterChange("category", value)}
          />
          <FilterGroup
            legend="Access"
            options={ticketFilters.map((value) => ({ value, label: ticketCopy[value] }))}
            active={filters.ticket}
            onChange={(value) => handleFilterChange("ticket", value)}
          />
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
              Date
            </legend>
            <div className="flex flex-wrap gap-2">
              {dateOptions.map((option) => (
                <ToggleButton
                  key={option.value}
                  label={option.label}
                  active={filters.date === option.value}
                  onClick={() => handleFilterChange("date", option.value)}
                />
              ))}
            </div>
          </fieldset>
          <p className="mt-4 text-xs text-white/60">
            Showing <span className="font-semibold text-white">{filtered.length}</span> of {events.length} events.
          </p>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-white/12 bg-black/40 p-10 text-center text-white/70">
          <p className="text-sm">
            No events match these filters yet. Reset for the full lineup or check back as we add new nights.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </section>
  );
}

interface FilterGroupProps<T extends string> {
  legend: string;
  options: FilterOption<T>[];
  active: T;
  onChange: (value: T) => void;
}

function FilterGroup<T extends string>({ legend, options, active, onChange }: FilterGroupProps<T>) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <ToggleButton
            key={option.value}
            label={option.label}
            active={active === option.value}
            onClick={() => onChange(option.value)}
          />
        ))}
      </div>
    </fieldset>
  );
}

interface ToggleButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function ToggleButton({ label, active, onClick }: ToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70 ${
        active
          ? "border-[rgba(var(--accent-primary-rgb),0.6)] bg-[linear-gradient(120deg,var(--accent-primary),rgba(var(--accent-primary-rgb),0.82),rgba(var(--accent-secondary-rgb),0.7))] text-black"
          : "border-white/20 bg-white/5 text-white/70 hover:border-white/40 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}
