import Link from "next/link";
import { SectionHeading } from "@/components/common/SectionHeading";

const highlights = [
  {
    title: "Upcoming events",
    description: "Skim the lineup and lock your night in seconds.",
    href: "/events",
    accent: "Events",
  },
  {
    title: "Reserve a VIP table",
    description: "Pick your section, confirm the deposit, done.",
    href: "/reservations",
    accent: "VIP",
  },
  {
    title: "Request a DJ callout",
    description: "Schedule shout-outs so your moment hits on cue.",
    href: "/callouts",
    accent: "Callout",
  },
];

export function ExperienceHighlights() {
  return (
    <section className="space-y-8">
      <SectionHeading
        eyebrow="Plan"
        title="Choose your vibe"
        description="Quick actions to keep the digital experience as smooth as our floor team."
      />
      <div className="grid gap-4 md:grid-cols-3">
        {highlights.map((highlight) => (
          <Link
            key={highlight.title}
            href={highlight.href}
            className="group relative overflow-hidden rounded-3xl border border-white/12 bg-black/60 p-6 text-white shadow-[0_40px_90px_-80px_rgba(4,6,8,0.8)] transition duration-300 hover:-translate-y-1 hover:border-white/40"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">
              {highlight.accent}
            </span>
            <h3 className="mt-3 text-lg font-semibold">{highlight.title}</h3>
            <p className="mt-2 text-sm text-white/70">{highlight.description}</p>
            <span className="mt-6 inline-flex items-center text-sm font-semibold text-[color:var(--accent-primary)]">
              Explore
              <span className="ml-2 transition-transform group-hover:translate-x-1" aria-hidden>
                →
              </span>
            </span>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(var(--accent-primary-rgb),0.28),transparent_55%)] opacity-0 transition duration-300 group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </section>
  );
}
