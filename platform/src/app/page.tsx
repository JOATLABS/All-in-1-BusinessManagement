import { Hero } from "@/components/hero/Hero";
import { PartnerBreadcrumb } from "@/components/layout/PartnerBreadcrumb";
import { ExperienceHighlights } from "@/components/sections/ExperienceHighlights";
import { GalleryPreview } from "@/components/sections/GalleryPreview";
import { EventsPreview } from "@/components/sections/EventsPreview";
import { ContactTeaser } from "@/components/sections/ContactTeaser";

export default function Home() {
  return (
    <div className="flex flex-col gap-16 pb-16">
      <PartnerBreadcrumb />
      <Hero />
      <GalleryPreview />
      <ExperienceHighlights />
      <EventsPreview />
      <ContactTeaser />
    </div>
  );
}
