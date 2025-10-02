import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Status",
  description: "Platform uptime, latency budgets and incident history.",
};

const statusItems = [
  { label: "Edge delivery", value: "Operational", detail: "Global latency 72ms p95" },
  { label: "Command center", value: "Operational", detail: "API uptime 99.98%" },
  { label: "Payments", value: "Degraded performance", detail: "Stripe maintenance window 02:00-02:30" },
  { label: "Messaging", value: "Operational", detail: "All channels within SLO" },
];

export default function StatusPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--accent-primary)] opacity-80">Status</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Platform health</h1>
        <p className="mt-3 max-w-2xl text-sm text-white/70">
          Synthetic monitors, RUM and service level objectives keep the guest experience within tight latency budgets.
        </p>
      </div>
      <div className="grid gap-4">
        {statusItems.map((item) => (
          <div key={item.label} className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{item.label}</span>
              <span
                className="rounded-full px-3 py-1 text-xs uppercase tracking-wide text-[color:var(--accent-primary)]"
                style={{
                  background:
                    item.value === "Degraded performance"
                      ? "rgba(var(--accent-primary-rgb),0.08)"
                      : "rgba(var(--accent-primary-rgb),0.16)",
                  border: "1px solid rgba(var(--accent-primary-rgb),0.35)",
                }}
              >
                {item.value}
              </span>
            </div>
            <p className="text-white/60">{item.detail}</p>
          </div>
        ))}
      </div>
      <div className="rounded-3xl border border-white/10 bg-black/40 p-6 text-sm text-white/70">
        <p className="font-semibold text-white">Incident response</p>
        <p className="mt-2">
          On-call teams follow a 4-step runbook: detect via PagerDuty, triage with observability dashboards, communicate updates within 15 minutes, and run post-incident reviews with promoter/vendor stakeholders.
        </p>
      </div>
    </div>
  );
}
