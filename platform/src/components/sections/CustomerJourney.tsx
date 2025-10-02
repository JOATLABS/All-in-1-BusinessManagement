import Link from "next/link";
import { customerHighlights } from "@/lib/data/services";
import { FeatureCard } from "@/components/common/FeatureCard";
import { SectionHeading } from "@/components/common/SectionHeading";

export function CustomerJourney() {
  return (
    <section id="experience" className="space-y-10">
      <SectionHeading
        eyebrow="Experience"
        title="Your night, choreographed"
        description="Every interaction is tuned for speed and style so guests can glide from discovery to their reserved section."
        actions={
          <Link
            href="/events"
            className="inline-flex items-center rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:border-white"
          >
            Explore events
          </Link>
        }
      />
      <div className="grid gap-6 md:grid-cols-3">
        {customerHighlights.map((feature) => (
          <FeatureCard key={feature.id} feature={feature} />
        ))}
      </div>
    </section>
  );
}
