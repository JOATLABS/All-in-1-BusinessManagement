import Link from "next/link";
import { SectionHeading } from "@/components/common/SectionHeading";

const playlistFeatures = [
  {
    title: "Live-set sync",
    description:
      "Setlists stream straight from the DJ booth so guests feel the room’s energy before they arrive.",
  },
  {
    title: "Personalised discovery",
    description:
      "Smart recommendations match guests with upcoming nights and cocktails that fit their vibe.",
  },
  {
    title: "Shout-out moments",
    description:
      "Schedule shout-outs, birthday callouts and curated dedications without breaking the flow of the mix.",
  },
];

export function PlaylistShowcase() {
  return (
    <section className="space-y-10">
      <SectionHeading
        eyebrow="Sound"
        title="Curated playlists & DJ shout-outs"
        description="Give guests a taste of the lounge soundscape while keeping shout-outs polished and on-beat."
        actions={
          <Link
            href="/playlists"
            className="inline-flex items-center rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:border-white"
          >
            Browse playlists
          </Link>
        }
      />
      <div className="grid gap-6 md:grid-cols-3">
        {playlistFeatures.map((feature) => (
          <div key={feature.title} className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
            <h3 className="text-lg font-semibold">{feature.title}</h3>
            <p className="mt-3 text-sm text-white/70">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
