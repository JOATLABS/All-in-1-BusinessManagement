"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { events } from "@/lib/data/events";
import { getDefaultPackageId, getEventPackages } from "@/lib/data/reservationPricing";

interface QuoteResponse {
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

export function ReservationForm() {
  const searchParams = useSearchParams();
  const presetEventId = searchParams.get("event") ?? undefined;
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>(presetEventId);
  const [selectedPackageId, setSelectedPackageId] = useState<string | undefined>(undefined);
  const [tables, setTables] = useState(2);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const minSpendFormatter = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }),
    []
  );

  const depositFormatter = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
      }),
    []
  );

  useEffect(() => {
    if (presetEventId && presetEventId !== selectedEventId) {
      setSelectedEventId(presetEventId);
    }
  }, [presetEventId, selectedEventId]);

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) ?? events[0],
    [selectedEventId]
  );

  const packages = useMemo(() => {
    if (!selectedEvent) {
      return [];
    }

    return getEventPackages(selectedEvent);
  }, [selectedEvent]);

  useEffect(() => {
    if (!selectedEvent) {
      setSelectedPackageId(undefined);
      return;
    }

    const defaultPackageId = getDefaultPackageId(selectedEvent);
    setSelectedPackageId((current) => {
      if (current && packages.some((pkg) => pkg.id === current)) {
        return current;
      }

      return defaultPackageId;
    });
  }, [selectedEvent, packages]);

  const selectedPackage = useMemo(
    () => packages.find((pkg) => pkg.id === selectedPackageId) ?? packages[0],
    [packages, selectedPackageId]
  );

  async function requestQuote() {
    if (!selectedEvent || !selectedPackage) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/reservations/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          tables,
          packageId: selectedPackage.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to calculate quote");
      }

      const data = (await response.json()) as { quote: QuoteResponse };
      setQuote(data.quote);
    } catch (err) {
      setError((err as Error).message);
      setQuote(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="space-y-6 rounded-3xl border border-white/10 bg-black/40 p-6 text-white"
      onSubmit={(event) => {
        event.preventDefault();
        requestQuote().catch(() => {
          // handled in requestQuote
        });
      }}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-semibold text-white/80">Select event</span>
          <select
            value={selectedEvent?.id}
            onChange={(event) => setSelectedEventId(event.target.value)}
            className="rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white focus:border-[rgba(var(--accent-primary-rgb),0.8)] focus:outline-none"
            aria-label="Select event"
          >
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title} — {new Date(event.start).toLocaleDateString()}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-semibold text-white/80">Tables requested</span>
          <input
            type="number"
            min={1}
            max={selectedEvent?.totalTables ?? 10}
            value={tables}
            onChange={(event) => setTables(Number(event.target.value))}
            className="rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white focus:border-[rgba(var(--accent-primary-rgb),0.8)] focus:outline-none"
          />
        </label>
      </div>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-semibold text-white/80">Select table experience</span>
        <select
          value={selectedPackage?.id}
          onChange={(event) => setSelectedPackageId(event.target.value)}
          className="rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white focus:border-[rgba(var(--accent-primary-rgb),0.8)] focus:outline-none"
        >
          {packages.map((pkg) => (
            <option key={pkg.id} value={pkg.id}>
              {pkg.title} · Seats {pkg.capacity} · Min spend {minSpendFormatter.format(pkg.minimumSpendPerTable)}
            </option>
          ))}
        </select>
        {selectedPackage ? (
          <p className="text-xs leading-relaxed text-white/60">
            {selectedPackage.description}
          </p>
        ) : null}
      </label>
      <button
        type="submit"
        className="inline-flex w-full items-center justify-center rounded-full bg-[linear-gradient(120deg,var(--accent-primary),rgba(var(--accent-primary-rgb),0.82),rgba(var(--accent-secondary-rgb),0.7))] px-6 py-3 text-sm font-semibold text-black transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(var(--accent-primary-rgb),0.6)]"
        disabled={loading}
      >
        {loading ? "Calculating quote…" : "Get deposit quote"}
      </button>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      {quote ? (
        <dl className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-white/60">Tables approved</dt>
            <dd className="font-semibold text-white">{quote.tablesApproved}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-white/60">Experience</dt>
            <dd className="font-semibold text-white">{quote.packageTitle}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-white/60">Deposit due</dt>
            <dd className="font-semibold text-[color:var(--accent-primary)]">
              {depositFormatter.format(quote.depositDue)}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-white/60">Deposit per table</dt>
            <dd className="font-semibold text-white">{depositFormatter.format(quote.depositPerTable)}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-white/60">Minimum spend</dt>
            <dd className="font-semibold text-white">
              {depositFormatter.format(quote.minimumSpendTotal)}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-white/60">Occupancy after reservation</dt>
            <dd className="font-semibold text-white">{quote.occupancyAfterReservation}%</dd>
          </div>
          {quote.waitlisted ? (
            <p className="rounded-xl border border-[rgba(var(--accent-primary-rgb),0.35)] bg-[rgba(var(--accent-primary-rgb),0.12)] px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[color:var(--accent-primary)]">
              Request exceeds availability — you will be added to the waitlist and notified automatically.
            </p>
          ) : null}
        </dl>
      ) : null}
    </form>
  );
}
