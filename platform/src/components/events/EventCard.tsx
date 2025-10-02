import Image from "next/image";
import Link from "next/link";
import { Event, calculateOccupancy } from "@/lib/data/events";
import { hasCriticalAvailability } from "@/lib/services/reservations";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const occupancy = calculateOccupancy(event);
  const critical = hasCriticalAvailability(event);
  const start = new Date(event.start);
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
  });
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <article className="flex flex-col overflow-hidden rounded-[32px] border border-white/12 bg-white/[0.04] backdrop-blur">
      <div className="relative h-56 w-full">
        <Image
          src={event.coverImage}
          alt={event.title}
          fill
          className="object-cover"
          priority={critical}
          sizes="(min-width: 768px) 400px, 100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute bottom-4 left-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-white">
          <span className="rounded-full bg-black/70 px-3 py-1">{event.category}</span>
          <span className="rounded-full bg-white/80 px-3 py-1 text-black">
            {event.ticketed ? "Ticketed" : "Host entry"}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-5 p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold leading-snug">{event.title}</h3>
            <p className="mt-2 text-sm text-white/70">{event.description}</p>
          </div>
          <div className="text-right text-xs text-white/60">
            <p className="font-semibold uppercase tracking-[0.3em] text-white/40">{dateFormatter.format(start)}</p>
            <p>{timeFormatter.format(start)}</p>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-4 text-xs text-white/60">
          <div>
            <dt className="font-semibold uppercase tracking-wide text-white/40">Headliner</dt>
            <dd className="text-white/80">{event.headlineAct}</dd>
          </div>
          <div>
            <dt className="font-semibold uppercase tracking-wide text-white/40">Venue</dt>
            <dd className="text-white/80">{event.venue}</dd>
          </div>
          <div>
            <dt className="font-semibold uppercase tracking-wide text-white/40">Presale</dt>
            <dd className="text-white/80">${event.presaleDeposit.toFixed(0)} deposit</dd>
          </div>
          <div>
            <dt className="font-semibold uppercase tracking-wide text-white/40">Sections left</dt>
            <dd className="text-white/80">{event.remainingTables}</dd>
          </div>
        </dl>
        <div>
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>{occupancy}% booked</span>
            <span>
              {event.remainingTables} of {event.totalTables} remaining
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full"
              style={{
                width: `${occupancy}%`,
                background: critical
                  ? "rgba(var(--accent-primary-rgb),0.9)"
                  : "rgba(255,255,255,0.5)",
              }}
            />
          </div>
        </div>
        <div className="mt-auto flex items-center justify-between pt-2">
          <Link
            href={`/reservations?event=${event.id}`}
            className="inline-flex items-center rounded-full bg-[linear-gradient(120deg,var(--accent-primary),rgba(var(--accent-primary-rgb),0.82),rgba(var(--accent-secondary-rgb),0.7))] px-4 py-2 text-sm font-semibold text-black transition hover:brightness-110"
          >
            Reserve now
          </Link>
          {critical ? (
            <span
              className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--accent-primary)]"
              style={{
                border: "1px solid rgba(var(--accent-primary-rgb),0.4)",
                background: "rgba(var(--accent-primary-rgb),0.14)",
              }}
            >
              Filling fast
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
