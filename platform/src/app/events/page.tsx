import { Metadata } from "next";
import { SectionHeading } from "@/components/common/SectionHeading";
import { EventsExplorer } from "@/components/events/EventsExplorer";
import { getUpcomingEvents } from "@/lib/data/events";

export const metadata: Metadata = {
  title: "Events",
  description: "Reserve sections and explore upcoming Afrobeat Lounge experiences.",
};

export default function EventsPage() {
  const upcoming = getUpcomingEvents();

  return (
    <div className="flex flex-col gap-12">
      <SectionHeading
        eyebrow="Line-up"
        title="Upcoming events"
        description="Updated the moment a DJ drops a new set time so you can lock your night without guesswork."
      />
      <EventsExplorer events={upcoming} />
    </div>
  );
}
