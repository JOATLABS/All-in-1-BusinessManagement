import { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/common/SectionHeading";

const playlists = [
  {
    id: "after-dark",
    title: "After Dark Amplified",
    vibe: "Late-night amapiano and alté bangers",
    length: "2h 10m",
    cta: "Stream on Spotify",
    url: "https://open.spotify.com/playlist/6afrobeatsaturday",
  },
  {
    id: "brunch-wave",
    title: "Brunch Wave",
    vibe: "Palm wine grooves and chilled afrobeats",
    length: "1h 45m",
    cta: "Stream on Apple Music",
    url: "https://music.apple.com", // placeholder
  },
  {
    id: "promoter-primer",
    title: "Host Essentials",
    vibe: "High-energy drops curated with our resident DJs for special celebrations",
    length: "1h 20m",
    cta: "Request private link",
    url: "mailto:music@afrobeatlounge.com",
  },
];

export const metadata: Metadata = {
  title: "Playlists",
  description: "Curated audio journeys with shout-outs, cocktail pairings and DJ set previews.",
};

export default function PlaylistsPage() {
  return (
    <div className="flex flex-col gap-12">
      <SectionHeading
        eyebrow="Sound"
        title="Curated playlists"
        description="AI-assisted programming adapts to guest behaviour while our resident DJs keep the vibe unmistakably human."
      />
      <div className="grid gap-6 md:grid-cols-3">
        {playlists.map((playlist) => (
          <div key={playlist.id} className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
            <h3 className="text-lg font-semibold">{playlist.title}</h3>
            <p className="mt-2 text-sm text-white/70">{playlist.vibe}</p>
            <p className="mt-4 text-xs uppercase tracking-wide text-white/50">Length {playlist.length}</p>
            <Link
              href={playlist.url}
              className="mt-6 inline-flex items-center rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:border-white"
            >
              {playlist.cta}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
