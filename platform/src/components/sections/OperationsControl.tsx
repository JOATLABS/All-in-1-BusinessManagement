import Link from "next/link";
import { managementHighlights, verificationChecklist } from "@/lib/data/services";
import { FeatureCard } from "@/components/common/FeatureCard";
import { SectionHeading } from "@/components/common/SectionHeading";

export function OperationsControl() {
  return (
    <section className="space-y-10">
      <SectionHeading
        eyebrow="Business HQ"
        title="Keep the lounge running smoothly"
        description="From staffing and stock to promoter paperwork, the management console keeps every back-of-house task on beat."
        actions={
          <Link
            href="/console"
            className="inline-flex items-center rounded-full bg-[linear-gradient(120deg,var(--accent-primary),rgba(var(--accent-primary-rgb),0.82),rgba(var(--accent-secondary-rgb),0.7))] px-4 py-2 text-sm font-semibold text-black transition hover:brightness-110"
          >
            Tour the management hub
          </Link>
        }
      />
      <div className="grid gap-6 md:grid-cols-2">
        {managementHighlights.map((feature) => (
          <FeatureCard key={feature.id} feature={feature} />
        ))}
      </div>
      <div className="rounded-3xl border border-[rgba(var(--accent-primary-rgb),0.35)] bg-[rgba(var(--accent-primary-rgb),0.12)] p-6 text-white">
        <h3 className="text-lg font-semibold">Verification gates before go-live</h3>
        <p className="mt-2 text-sm text-white/70">
          Every release ships with automated checks to maintain performance, resilience and security across lounge locations.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {verificationChecklist.map((feature) => (
            <div key={feature.id} className="rounded-2xl border border-white/10 bg-black/50 p-4">
              <p className="text-2xl" aria-hidden>
                {feature.icon}
              </p>
              <h4 className="mt-3 text-base font-semibold">{feature.title}</h4>
              <p className="mt-2 text-xs text-white/60">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
