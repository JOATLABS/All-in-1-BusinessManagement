import Link from "next/link";
import { getFeaturedEvents } from "@/lib/data/events";
import { EventCard } from "@/components/events/EventCard";
import { SectionHeading } from "@/components/common/SectionHeading";

export function EventsPreview() {
  const featured = getFeaturedEvents(2);

  return (
    <section className="space-y-8">
      <SectionHeading
        eyebrow="This week"
        title="Featured nights"
        description="Fast glance at the lineups filling first."
        actions={
          <Link
            href="/events"
            className="inline-flex items-center rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:border-white"
          >
            See all events
          </Link>
        }
      />
      <div className="grid gap-6 md:grid-cols-2">
        {featured.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}
