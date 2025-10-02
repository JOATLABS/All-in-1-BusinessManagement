import { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/common/SectionHeading";

const calloutHighlights = [
  {
    title: "Reserve a slot",
    description:
      "Pick your night and share pronunciation notes so the DJ nails your crew’s energy on the first drop.",
    icon: "🎟️",
  },
  {
    title: "Curate the moment",
    description:
      "Upload photos, select the beat and add on-screen captions for the LED walls right from the form.",
    icon: "🪩",
  },
  {
    title: "Get confirmation",
    description:
      "Automated updates hit your inbox and the DJ booth tablet so everyone is ready when you arrive.",
    icon: "📬",
  },
];

const preparationSteps = [
  "Choose the celebration type (birthday, engagement, reunion, corporate hype).",
  "Tell us who to spotlight and how to pronounce names.",
  "Pick the track snippet or vibe to back the shout-out.",
  "Add any LED wall copy or emoji flair.",
  "Confirm the reservation add-on and you’re set.",
];

export const metadata: Metadata = {
  title: "DJ Callouts",
  description:
    "Schedule custom shout-outs, song drops and celebration moments that sync with your reservation.",
};

export default function CalloutsPage() {
  return (
    <div className="flex flex-col gap-16">
      <SectionHeading
        eyebrow="Callouts"
        title="Lock in your spotlight"
        description="We treat shout-outs like mini-productions so your celebration feels cinematic, not improvised."
        actions={
          <Link
            href="/reservations"
            className="inline-flex items-center rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:border-white"
          >
            Attach to reservation
          </Link>
        }
      />
      <div className="grid gap-6 md:grid-cols-3">
        {calloutHighlights.map((highlight) => (
          <div
            key={highlight.title}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white"
          >
            <span className="text-3xl" aria-hidden>
              {highlight.icon}
            </span>
            <h3 className="mt-4 text-lg font-semibold">{highlight.title}</h3>
            <p className="mt-3 text-sm text-white/70">{highlight.description}</p>
          </div>
        ))}
      </div>
      <div className="rounded-3xl border border-white/10 bg-black/60 p-8 text-white">
        <h2 className="text-xl font-semibold">How to prepare your shout-out</h2>
        <ol className="mt-4 space-y-3 text-sm text-white/70">
          {preparationSteps.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/30 text-xs font-semibold text-white/70">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm text-white/60">
          Requests lock one business day before your event to give the DJ team time to rehearse transitions and sync visuals.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
          <h3 className="text-lg font-semibold">Audio specs</h3>
          <p className="mt-3 text-sm text-white/70">
            Provide a link to Spotify, Apple Music or upload a 30-second clip. We fade tracks tastefully and align them with your celebration.
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
          <h3 className="text-lg font-semibold">Visual cues</h3>
          <p className="mt-3 text-sm text-white/70">
            LED walls and lighting react to your request. Add colors or phrases and we’ll program the cues into the show file.
          </p>
        </div>
      </div>
    </div>
  );
}
