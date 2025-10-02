import { SectionHeading } from "@/components/common/SectionHeading";

const commitments = [
  {
    title: "Edge-first delivery",
    detail: "Next.js App Router with ISR keeps hero content cached at the edge for sub-100ms loads, even on mobile data.",
  },
  {
    title: "Accessibility audits",
    detail: "Continuous axe scans and keyboard-first navigation ensure WCAG 2.2 AA compliance across flows.",
  },
  {
    title: "Observability stack",
    detail: "Telemetry streams to OpenTelemetry collectors, Grafana dashboards and PagerDuty alerting for the in-house team.",
  },
  {
    title: "Guest & partner privacy",
    detail: "Scoped tokens, encrypted storage and automated backups protect reservation, guest list and vendor records.",
  },
];

export function PerformancePledge() {
  return (
    <section className="space-y-10">
      <SectionHeading
        eyebrow="Reliability"
        title="Performance, accessibility & trust baked in"
        description="Every feature ships with automation, testing and monitoring aligned to the roadmap and README objectives."
      />
      <div className="grid gap-6 md:grid-cols-2">
        {commitments.map((commitment) => (
          <div key={commitment.title} className="rounded-3xl border border-white/10 bg-black/50 p-6 text-white">
            <h3 className="text-lg font-semibold">{commitment.title}</h3>
            <p className="mt-3 text-sm text-white/70">{commitment.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
