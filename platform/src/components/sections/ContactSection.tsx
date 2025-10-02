import Link from "next/link";
import { SectionHeading } from "@/components/common/SectionHeading";

export function ContactSection() {
  return (
    <section id="contact" className="space-y-10">
      <SectionHeading
        eyebrow="Connect"
        title="Plan the perfect celebration"
        description="Reach our host team for private bookings, multi-night residencies or questions about the lounge experience."
      />
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-black/55 p-6 text-white">
          <h3 className="text-lg font-semibold">Talk to a host</h3>
          <p className="mt-2 text-sm text-white/70">
            Call or text for same-night availability, bottle upgrades and concierge support.
          </p>
          <Link href="tel:+14045551234" className="mt-4 inline-flex text-sm font-semibold text-[color:var(--accent-primary)] hover:text-white">
            +1 (404) 555-1234
          </Link>
        </div>
        <div className="rounded-3xl border border-white/10 bg-black/55 p-6 text-white">
          <h3 className="text-lg font-semibold">Private events</h3>
          <p className="mt-2 text-sm text-white/70">
            Reserve the entire venue or our listening room for corporate mixers, album drops and launch parties.
          </p>
          <Link
            href="mailto:events@afrobeatlounge.com"
            className="mt-4 inline-flex text-sm font-semibold text-[color:var(--accent-primary)] hover:text-white"
          >
            events@afrobeatlounge.com
          </Link>
        </div>
        <div className="rounded-3xl border border-[rgba(var(--accent-primary-rgb),0.35)] bg-[rgba(var(--accent-primary-rgb),0.12)] p-6 text-white">
          <h3 className="text-lg font-semibold">Ready to reserve?</h3>
          <p className="mt-2 text-sm text-white/70">
            Lock in your section with a low deposit and add DJ shout-outs or dessert towers during checkout.
          </p>
          <Link
            href="/reservations"
            className="mt-4 inline-flex items-center rounded-full bg-[linear-gradient(120deg,var(--accent-primary),rgba(var(--accent-primary-rgb),0.82),rgba(var(--accent-secondary-rgb),0.7))] px-4 py-2 text-sm font-semibold text-black transition hover:brightness-110"
          >
            Start a reservation
          </Link>
        </div>
      </div>
    </section>
  );
}
