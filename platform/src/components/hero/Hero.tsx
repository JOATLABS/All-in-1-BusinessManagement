import Image from "next/image";
import Link from "next/link";
import { StatPill } from "@/components/common/StatPill";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden rounded-[60px] border border-white/10 bg-black/75 px-8 py-16 text-white shadow-[0_120px_180px_-120px_rgba(0,0,0,0.9)] md:px-14">
      <div className="absolute inset-0 -z-20">
        <Image
          src="https://images.unsplash.com/photo-1604079628040-94301bb21b11?auto=format&fit=crop&w=2000&q=80"
          alt="Guests dancing under warm amber lighting inside the lounge."
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/75 to-black/95" aria-hidden />
      </div>
      <div className="pointer-events-none absolute -left-24 top-12 h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(var(--accent-primary-rgb),0.32),_transparent_55%)] blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,_rgba(82,4,68,0.4),_transparent_60%)] blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[conic-gradient(from_120deg,_rgba(var(--accent-primary-rgb),0.28),rgba(86,10,72,0.22),rgba(0,0,0,0.5))] blur-3xl" aria-hidden />
      <div className="relative z-10 grid gap-14 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-white/70 backdrop-blur">
            <span className="inline-flex h-2 w-2 rounded-full bg-[radial-gradient(circle,var(--accent-primary),rgba(var(--accent-primary-rgb),0.45))]" aria-hidden />
            Afro luxe weekends • ATL
          </div>
          <h1 className="max-w-2xl text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-white via-white to-[color:var(--accent-primary)] bg-clip-text text-transparent">
              Atlanta’s Afrobeat sanctuary.
            </span>
          </h1>
          <p className="max-w-sm text-base text-white/75 md:text-lg">Reserve a section. We’ll set the vibe.</p>
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <Link
              href="/reservations"
              className="inline-flex items-center gap-3 rounded-full bg-[linear-gradient(120deg,var(--accent-primary),rgba(var(--accent-primary-rgb),0.82),rgba(var(--accent-secondary-rgb),0.68))] px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-black shadow-[0_24px_70px_-25px_rgba(var(--accent-primary-rgb),0.65)] transition hover:brightness-110"
            >
              Reserve tonight
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white/85 transition hover:border-white hover:text-white"
            >
              View the gallery
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatPill label="Tonight" value="Skyline" detail="Fridays" />
            <StatPill label="DJ" value="Nova" detail="Amapiano" />
            <StatPill label="Sections" value="07" detail="Live" />
          </div>
        </div>
        <div className="relative flex h-full items-center justify-center">
          <div className="relative w-full max-w-sm">
            <div className="pointer-events-none absolute -top-12 -left-10 h-32 w-32 rounded-full bg-[radial-gradient(circle,_rgba(var(--accent-primary-rgb),0.35),_transparent_60%)] blur-2xl" aria-hidden />
            <figure className="relative overflow-hidden rounded-[40px] border border-white/15 bg-black/50 p-1 shadow-[0_50px_120px_-90px_rgba(4,6,8,0.85)] backdrop-blur">
              <div className="absolute inset-0 rounded-[40px] border border-white/5" aria-hidden />
              <Image
                src="https://images.unsplash.com/photo-1561488115-cc75d532b90d?auto=format&fit=crop&w=1400&q=80"
                alt="VIP booth with glowing bottles and friends laughing."
                width={640}
                height={800}
                className="h-[480px] w-full rounded-[36px] object-cover"
                priority
              />
              <div className="absolute inset-x-6 bottom-6 flex items-center justify-between rounded-full border border-white/20 bg-black/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
                <span>Sparkler parade</span>
                <span>02:15 AM</span>
              </div>
            </figure>
            <div className="absolute -bottom-12 left-6 w-40 rounded-3xl border border-white/15 bg-white/10 p-4 text-left text-xs font-medium uppercase tracking-[0.25em] text-white/70 shadow-[0_40px_120px_-90px_rgba(4,6,8,0.9)] backdrop-blur">
              <p className="text-[11px] text-white/60">DJ shout-out queue</p>
              <p className="mt-2 text-lg font-semibold text-white">5 spots left</p>
            </div>
            <div className="absolute -right-8 top-12 w-36 rounded-3xl border border-white/10 bg-gradient-to-br from-white/15 via-white/5 to-transparent p-4 text-xs font-medium text-white/80 backdrop-blur">
              <p className="uppercase tracking-[0.3em] text-white/50">Concierge</p>
              <p className="mt-2 text-sm font-semibold text-white">Bottle notes confirmed</p>
              <p className="mt-1 text-[11px] text-white/60">Peach fizz & sparklers</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
