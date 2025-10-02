export interface ServiceFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  audience: "guest" | "promoter" | "vendor" | "admin";
}

export const customerHighlights: ServiceFeature[] = [
  {
    id: "instant-booking",
    title: "Hold your section in seconds",
    description:
      "Reserve couches, cocktail trees and bottle service with real-time confirmation before your crew leaves the house.",
    icon: "⚡",
    audience: "guest",
  },
  {
    id: "immersive-preview",
    title: "See the vibe before arrival",
    description:
      "Hero film, lighting palettes and playlists adapt to the night so you can pick the atmosphere that matches your mood.",
    icon: "🌌",
    audience: "guest",
  },
  {
    id: "concierge-touch",
    title: "Concierge touches",
    description:
      "Pre-order mixers, schedule DJ callouts and note celebrations so the host team greets you with everything prepared.",
    icon: "🎧",
    audience: "guest",
  },
];

export const guestServices: ServiceFeature[] = [
  {
    id: "vip-lounges",
    title: "VIP lounges",
    description:
      "Wrap-around sofas, private attendants and chilled champagne towers ready as soon as you check in.",
    icon: "🥂",
    audience: "guest",
  },
  {
    id: "bottle-packages",
    title: "Signature bottle packages",
    description:
      "Curated pairings with infused mixers and small bites designed with our mixology team for every weekend slate.",
    icon: "🍾",
    audience: "guest",
  },
  {
    id: "dj-shoutouts",
    title: "DJ callouts",
    description:
      "Line up birthday drops, engagement reveals or reunion shout-outs without stepping away from the dance floor.",
    icon: "📣",
    audience: "guest",
  },
];

export const managementHighlights: ServiceFeature[] = [
  {
    id: "inventory-automation",
    title: "Inventory automation",
    description:
      "Track back-of-house stock, vendor pricing and reorder points with alerts before the bar runs dry.",
    icon: "📦",
    audience: "admin",
  },
  {
    id: "contract-workflows",
    title: "Contract workflows",
    description:
      "Keep DJ and promoter rosters organised with e-signatures, reminders and shared asset folders.",
    icon: "📝",
    audience: "promoter",
  },
  {
    id: "finance-ops",
    title: "Finance & payouts",
    description:
      "Monitor deposits, bottle sales and partner payouts with a ledger built for the lounge’s own books.",
    icon: "💳",
    audience: "admin",
  },
  {
    id: "insights",
    title: "Insights cockpit",
    description:
      "Analytics blend POS, reservations and marketing data so the team can tune staffing and spend per location.",
    icon: "📊",
    audience: "admin",
  },
];

export const verificationChecklist: ServiceFeature[] = [
  {
    id: "frontend-tests",
    title: "Frontend validation",
    description:
      "Component level tests ensure hero CTAs, availability meters and flows render for every lounge theme.",
    icon: "✅",
    audience: "guest",
  },
  {
    id: "backend-tests",
    title: "Backend safeguards",
    description:
      "Reservation safeguards enforce table caps, deposit math and RBAC before promotions go live.",
    icon: "🛡️",
    audience: "admin",
  },
  {
    id: "observability",
    title: "Observability hooks",
    description:
      "Structured logs, traces and synthetic monitors back every release with actionable telemetry.",
    icon: "🛰️",
    audience: "admin",
  },
];
