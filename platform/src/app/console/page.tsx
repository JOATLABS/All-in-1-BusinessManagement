import { Metadata } from "next";
import { SectionHeading } from "@/components/common/SectionHeading";

const ownerModules = [
  {
    title: "Venue control centre",
    description:
      "Spin up new nights, manage staffing rosters and adjust floor plans with guardrails tied to your lounge themes.",
  },
  {
    title: "Inventory & finance",
    description:
      "Monitor stock levels, vendor pricing and bottle costs while reconciling deposits, gratuity and nightly revenue.",
  },
  {
    title: "Marketing studio",
    description:
      "Schedule drops, sync playlists to events and launch SMS or email campaigns with built-in approval flows.",
  },
  {
    title: "Insights & compliance",
    description:
      "Access analytics that merge reservations, POS and guest feedback with audit trails for every change.",
  },
];

const partnerModules = [
  {
    title: "Promoter workspace",
    description:
      "Review confirmed dates, deliver creative assets and track guest list growth with transparent settlement status.",
  },
  {
    title: "Vendor management",
    description:
      "Vendors update menus, restock requests and invoices while collaborating with the owner team on activations.",
  },
  {
    title: "Real-time performance",
    description:
      "Dashboards highlight bar spend, section upgrades and shout-out redemption during each activation.",
  },
];

export const metadata: Metadata = {
  title: "Command Center",
  description: "In-house console for operations, marketing, finance and observability across lounge locations.",
};

export default function ConsolePage() {
  return (
    <div className="flex flex-col gap-12">
      <SectionHeading
        eyebrow="Operations"
        title="Command center overview"
        description="A unified workspace for the lounge owner plus a dedicated portal for promoters and vendors, both aligned with the customer-facing site."
      />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
          <h3 className="text-lg font-semibold">Owner dashboard</h3>
          <p className="text-sm text-white/70">
            Built for the lounge owner and leadership team. Configure the customer website, manage bookings and keep operations
            synced across locations.
          </p>
          <div className="grid gap-4">
            {ownerModules.map((module) => (
              <div key={module.title} className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <h4 className="text-base font-semibold">{module.title}</h4>
                <p className="mt-2 text-sm text-white/70">{module.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
          <h3 className="text-lg font-semibold">Vendor & promoter portal</h3>
          <p className="text-sm text-white/70">
            External partners receive scoped access to contribute programming, update deliverables and review results without
            exposing owner-only data.
          </p>
          <div className="grid gap-4">
            {partnerModules.map((module) => (
              <div key={module.title} className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <h4 className="text-base font-semibold">{module.title}</h4>
                <p className="mt-2 text-sm text-white/70">{module.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-3xl border border-white/10 bg-[rgba(var(--accent-primary-rgb),0.14)] p-6 text-white">
        <h3 className="text-lg font-semibold">Latency & UX guardrails</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-white/80">
          <li>Realtime dashboards stream via edge-friendly data fetching with revalidation budgets under 60 seconds.</li>
          <li>Task flows use keyboard-first patterns, inline validation and offline resilience for the host stand.</li>
          <li>Every module instrumented with tracing, structured logs and alerts tied to on-call rotations.</li>
        </ul>
      </div>
    </div>
  );
}
