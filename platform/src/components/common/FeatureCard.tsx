import { ServiceFeature } from "@/lib/data/services";

interface FeatureCardProps {
  feature: ServiceFeature;
}

export function FeatureCard({ feature }: FeatureCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-[28px] border border-white/12 bg-white/[0.04] px-6 py-8 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.8)] transition hover:-translate-y-1 hover:border-white/30">
      <div className="flex items-center justify-between">
        <span className="text-3xl" aria-hidden>
          {feature.icon}
        </span>
        <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/60">
          {feature.audience}
        </span>
      </div>
      <h3 className="mt-6 text-lg font-semibold text-white">{feature.title}</h3>
      <p className="mt-3 text-sm leading-6 text-white/70">{feature.description}</p>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/10 opacity-0 transition duration-500 group-hover:opacity-100" />
    </article>
  );
}
