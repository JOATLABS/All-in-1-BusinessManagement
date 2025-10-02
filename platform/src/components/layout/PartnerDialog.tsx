"use client";

import { useEffect } from "react";

interface PartnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const partnerHighlights = [
  {
    title: "Residency & vendor onboarding",
    description:
      "Submit your concept, preferred dates and hospitality requirements. We align each activation with the lounge vibe before confirming slots.",
  },
  {
    title: "Campaign performance",
    description:
      "Access dashboards for guest list growth, bar spend and engagement so every collaboration delivers measurable impact.",
  },
  {
    title: "Concierge support",
    description:
      "Our partnerships team handles contracts, creative approvals and settlement schedules so you can focus on experience design.",
  },
];

export function PartnerDialog({ open, onOpenChange }: PartnerDialogProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="partner-dialog-title"
        className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-[32px] border border-white/15 bg-black/85 p-8 text-white shadow-[0_40px_140px_-90px_rgba(4,6,8,0.9)]"
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-6 top-6 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-xl text-white/60 transition hover:border-white hover:text-white"
          aria-label="Close partner details"
        >
          ×
        </button>
        <div className="space-y-6 pr-10">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[color:var(--accent-primary)] opacity-80">Partner with us</p>
            <h2 id="partner-dialog-title" className="text-3xl font-semibold leading-tight">
              Vendor & promoter collaboration hub
            </h2>
            <p className="text-sm text-white/70">
              Share your concept and we&apos;ll tailor residencies, pop-ups or vendor showcases that amplify the Afrobeat Lounge experience while protecting guest comfort.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {partnerHighlights.map((item) => (
              <div key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <h3 className="text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-white/70">{item.description}</p>
              </div>
            ))}
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/50 p-6">
            <h3 className="text-lg font-semibold">Start the conversation</h3>
            <p className="mt-2 text-sm text-white/70">
              Email <a href="mailto:partners@afrobeatlounge.com" className="underline decoration-[color:var(--accent-primary)] decoration-2 underline-offset-4 hover:text-[color:var(--accent-primary)]">partners@afrobeatlounge.com</a> with your desired dates and audience focus.
              We respond within two business days with availability and next steps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
