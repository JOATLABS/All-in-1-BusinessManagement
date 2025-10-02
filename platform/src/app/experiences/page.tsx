import { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ServicesShowcase } from "@/components/sections/ServicesShowcase";
import { CustomerJourney } from "@/components/sections/CustomerJourney";
import { PlaylistShowcase } from "@/components/sections/PlaylistShowcase";
import { PerformancePledge } from "@/components/sections/PerformancePledge";

export const metadata: Metadata = {
  title: "Experiences",
  description:
    "Preview lounge services, concierge touches and the technology that keeps every guest flow fast.",
};

export default function ExperiencesPage() {
  return (
    <div className="flex flex-col gap-16">
      <SectionHeading
        eyebrow="Experiences"
        title="Design your night"
        description="A curated breakdown of services and digital flows that keep Afrobeat Lounge moving without friction."
        actions={
          <Link
            href="/reservations"
            className="inline-flex items-center rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:border-white"
          >
            Start a reservation
          </Link>
        }
      />
      <ServicesShowcase />
      <CustomerJourney />
      <PlaylistShowcase />
      <PerformancePledge />
    </div>
  );
}
