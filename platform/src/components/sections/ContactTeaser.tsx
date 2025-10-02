import Link from "next/link";

export function ContactTeaser() {
  return (
    <section className="rounded-[36px] border border-white/10 bg-black/65 p-10 text-white">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Need a hand?</p>
          <h2 className="mt-3 text-2xl font-semibold md:text-3xl">Talk to our host team</h2>
          <p className="mt-2 max-w-xl text-sm text-white/70">
            Text ahead for bottle add-ons, surprise drops, or quick guest check-in.
          </p>
        </div>
        <div className="flex flex-col gap-3 text-sm font-semibold text-white">
          <Link
            href="tel:+14045551234"
            className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(120deg,var(--accent-primary),rgba(var(--accent-primary-rgb),0.82),rgba(var(--accent-secondary-rgb),0.7))] px-5 py-3 text-black transition hover:brightness-110"
          >
            Call or text +1 (404) 555-1234
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-full border border-white/30 px-5 py-3 transition hover:border-white"
          >
            All contact options
          </Link>
        </div>
      </div>
    </section>
  );
}
