import { guestServices } from "@/lib/data/services";
import { SectionHeading } from "@/components/common/SectionHeading";

export function ServicesShowcase() {
  return (
    <section id="services" className="space-y-10">
      <SectionHeading
        eyebrow="Services"
        title="Weekend luxuries tailored to your crew"
        description="Choose from curated packages that keep the night smooth — from private lounges to live DJ callouts."
      />
      <div className="grid gap-6 md:grid-cols-3">
        {guestServices.map((service) => (
          <div
            key={service.id}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black/55 p-6 text-white transition hover:-translate-y-1 hover:border-white/40"
          >
            <div className="text-3xl" aria-hidden>
              {service.icon}
            </div>
            <h3 className="mt-4 text-lg font-semibold">{service.title}</h3>
            <p className="mt-2 text-sm text-white/70">{service.description}</p>
            <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-20 bg-[radial-gradient(circle_at_top,rgba(var(--accent-primary-rgb),0.35),transparent_60%)]" />
          </div>
        ))}
      </div>
    </section>
  );
}
