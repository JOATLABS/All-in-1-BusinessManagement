export type EventCategory = "night" | "day" | "community" | "launch";

export interface Event {
  id: string;
  title: string;
  category: EventCategory;
  headlineAct: string;
  start: string;
  end: string;
  venue: string;
  description: string;
  remainingTables: number;
  totalTables: number;
  ticketed: boolean;
  presaleDeposit: number;
  playlistUrl: string;
  coverImage: string;
}

export const events: Event[] = [
  {
    id: "sonic-moon-0405",
    title: "Sonic Moon Sessions",
    category: "night",
    headlineAct: "DJ Naija Nova",
    start: "2025-04-05T22:00:00-05:00",
    end: "2025-04-06T03:00:00-05:00",
    venue: "Afrobeat Lounge Main Hall",
    description:
      "A signature Saturday night filled with amapiano and alté mashups, featuring immersive lighting synced to the beat.",
    remainingTables: 6,
    totalTables: 24,
    ticketed: false,
    presaleDeposit: 150,
    playlistUrl: "https://open.spotify.com/playlist/6afrobeatsaturday",
    coverImage:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "lagos-sunrise-0411",
    title: "Lagos Sunrise Brunch",
    category: "day",
    headlineAct: "DJ Tems Tempo",
    start: "2025-04-11T12:00:00-05:00",
    end: "2025-04-11T16:00:00-05:00",
    venue: "Sky Deck",
    description:
      "Day-party vibes with brunch service, bottomless palm mimosa flights and a rooftop photo experience.",
    remainingTables: 4,
    totalTables: 18,
    ticketed: true,
    presaleDeposit: 50,
    playlistUrl: "https://open.spotify.com/playlist/lagossunrise",
    coverImage:
      "https://images.unsplash.com/photo-1525281579964-5e98c5f43de2?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "writers-round-0420",
    title: "Afrobeats Writers Round",
    category: "community",
    headlineAct: "Hosted by The Rhythm Guild",
    start: "2025-04-20T19:00:00-05:00",
    end: "2025-04-20T22:00:00-05:00",
    venue: "Listening Room",
    description:
      "An intimate storytelling experience where emerging artists preview original tracks and receive live feedback.",
    remainingTables: 12,
    totalTables: 20,
    ticketed: false,
    presaleDeposit: 0,
    playlistUrl: "https://open.spotify.com/playlist/writersround",
    coverImage:
      "https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "tech-meets-vibes-0426",
    title: "Tech Meets Vibes",
    category: "launch",
    headlineAct: "Special Guest: DJ Spinall",
    start: "2025-04-26T20:00:00-05:00",
    end: "2025-04-27T02:00:00-05:00",
    venue: "Innovation Hall",
    description:
      "A brand partnership takeover featuring experiential marketing activations and collaborative sponsor lounges.",
    remainingTables: 2,
    totalTables: 30,
    ticketed: true,
    presaleDeposit: 200,
    playlistUrl: "https://open.spotify.com/playlist/techmeetsvibes",
    coverImage:
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1200&q=80",
  },
];

export function isEventCategory(value: string): value is EventCategory {
  return ("night" === value || "day" === value || "community" === value || "launch" === value);
}

export function getUpcomingEvents(reference: Date = new Date()): Event[] {
  return events
    .filter((event) => new Date(event.end).getTime() >= reference.getTime())
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

export function getFeaturedEvents(limit = 3): Event[] {
  return [...events]
    .sort((a, b) => a.remainingTables / a.totalTables - b.remainingTables / b.totalTables)
    .slice(0, limit);
}

export function calculateOccupancy(event: Event): number {
  if (event.totalTables === 0) {
    return 0;
  }

  return Math.round(((event.totalTables - event.remainingTables) / event.totalTables) * 100);
}
