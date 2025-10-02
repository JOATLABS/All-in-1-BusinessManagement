import Link from "next/link";

const footerLinks = [
  { href: "/experiences", label: "Experiences" },
  { href: "/callouts", label: "DJ callouts" },
  { href: "/gallery", label: "Gallery" },
  { href: "/privacy", label: "Privacy" },
  { href: "/status", label: "Status" },
  { href: "/console", label: "Tenant sign-in" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-black/80 py-10 text-sm text-white/60">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 px-6 md:flex-row md:items-center">
        <p>
          Built for the Afrobeat Lounge collective. Low-latency experiences powered by edge rendering and design systems crafted
          for nightlife hospitality.
        </p>
        <nav className="flex flex-wrap items-center gap-4">
          {footerLinks.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
