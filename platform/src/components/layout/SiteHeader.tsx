"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/experiences", label: "Experiences" },
  { href: "/reservations", label: "Reserve" },
  { href: "/callouts", label: "DJ Callouts" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-b from-black/80 via-black/65 to-transparent backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <div className="group relative flex items-center justify-between gap-4 overflow-hidden rounded-full border border-white/10 bg-black/60 px-5 py-3 text-white shadow-[0_32px_120px_-90px_rgba(4,6,8,0.85)] backdrop-blur-xl">
          <div
            className="pointer-events-none absolute -inset-px -z-10 opacity-0 transition duration-700 group-hover:opacity-100"
            style={{
              background: "linear-gradient(120deg, rgba(var(--accent-primary-rgb),0.32), rgba(82, 6, 72, 0.42), rgba(0, 0, 0, 0.65))",
            }}
            aria-hidden
          />
          <Link href="/" className="flex items-center gap-3 text-white">
            <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,#ffbde2,#ff5d9e)] text-lg font-bold text-black shadow-[0_10px_25px_rgba(var(--accent-primary-rgb),0.35)]">
              OL
            </span>
            <span className="hidden flex-col text-[11px] font-semibold uppercase tracking-[0.45em] text-white/50 sm:flex">
              <span>Afrobeat</span>
              <span className="text-white/80">Lounge</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-white/70 lg:flex">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group/nav relative inline-flex items-center transition hover:text-white ${
                    isActive ? "text-white" : ""
                  }`}
                >
                  {item.label}
                  <span
                    className={`pointer-events-none absolute -bottom-2 left-0 h-0.5 w-full origin-left scale-x-0 bg-[linear-gradient(120deg,var(--accent-primary),rgba(var(--accent-primary-rgb),0.7),rgba(var(--accent-secondary-rgb),0.75))] transition-transform duration-300 ${
                      isActive ? "scale-x-100" : "group-hover/nav:scale-x-100"
                    }`}
                    aria-hidden
                  />
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/reservations"
              className="inline-flex items-center rounded-full bg-[linear-gradient(120deg,var(--accent-primary),rgba(var(--accent-primary-rgb),0.82),rgba(var(--accent-secondary-rgb),0.7))] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-black shadow-[0_10px_30px_rgba(var(--accent-primary-rgb),0.4)] transition hover:brightness-110"
            >
              Reserve
            </Link>
            <Link
              href="/console"
              className="hidden rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/70 transition hover:border-white hover:text-white sm:inline-flex"
            >
              Manager
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
