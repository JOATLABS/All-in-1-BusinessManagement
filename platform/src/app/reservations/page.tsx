import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ReservationForm } from "@/components/forms/ReservationForm";
import { SectionHeading } from "@/components/common/SectionHeading";

export const metadata: Metadata = {
  title: "Reservations",
  description: "Secure your lounge experience with automated deposits and availability checks.",
};

export default function ReservationsPage() {
  return (
    <div className="flex flex-col gap-12">
      <SectionHeading
        eyebrow="Reservations"
        title="Reserve your section in minutes"
        description="Edge-backed APIs confirm availability, calculate deposits and text our host team so everything’s ready on arrival."
        actions={
          <Link
            href="/events"
            className="inline-flex items-center rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:border-white"
          >
            View upcoming events
          </Link>
        }
      />
      <Suspense fallback={<div className="rounded-3xl border border-white/10 bg-black/40 p-6 text-white/60">Loading reservations…</div>}>
        <ReservationForm />
      </Suspense>
      <div className="grid gap-4 text-sm text-white/70 md:grid-cols-3">
        <p className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <span className="font-semibold text-white">Instant confirmation.</span> Deposits process through Stripe for zero line friction.
        </p>
        <p className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <span className="font-semibold text-white">Coordinated with hosts.</span> Confirmations notify the lounge team for bottle prep and greetings.
        </p>
        <p className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <span className="font-semibold text-white">Accessible by design.</span> Fully keyboard navigable with live region updates for quotes.
        </p>
      </div>
    </div>
  );
}
