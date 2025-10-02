import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  metadataBase: new URL("https://afrobeat-lounge.example.com"),
  title: {
    template: "%s | Afrobeat Lounge Platform",
    default: "Afrobeat Lounge Platform",
  },
  description:
    "Afrobeat lounge website for guests to explore events, galleries and VIP services, plus a secure management console for the owner, vendors and promoters.",
  openGraph: {
    title: "Afrobeat Lounge Platform",
    description:
      "Immersive nightlife experience with reservations, curated playlists, galleries and an in-house management console.",
    url: "https://afrobeat-lounge.example.com",
    siteName: "Afrobeat Lounge",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Afrobeat Lounge Platform",
    description:
      "Immersive nightlife website with fast reservations, playlists, photo galleries and a secure owner console.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-[#05060a] text-white antialiased">
        <div className="relative flex min-h-screen flex-col font-sans">
          <SiteHeader />
          <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-16 px-6 py-16">
            {children}
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
