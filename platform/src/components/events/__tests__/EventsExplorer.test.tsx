import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EventsExplorer } from "@/components/events/EventsExplorer";
import { Event } from "@/lib/data/events";

const sampleEvents: Event[] = [
  {
    id: "night-ticketed",
    title: "Sonic Moon Sessions",
    category: "night",
    headlineAct: "DJ Naija Nova",
    start: "2025-04-05T22:00:00-05:00",
    end: "2025-04-06T03:00:00-05:00",
    venue: "Afrobeat Lounge",
    description: "Late-night amapiano and alté mashups.",
    remainingTables: 6,
    totalTables: 24,
    ticketed: true,
    presaleDeposit: 150,
    playlistUrl: "https://example.com/playlist",
    coverImage: "https://example.com/image.jpg",
  },
  {
    id: "day-host",
    title: "Palm Grove Brunch",
    category: "day",
    headlineAct: "DJ Tems Tempo",
    start: "2025-04-06T12:00:00-05:00",
    end: "2025-04-06T16:00:00-05:00",
    venue: "Sky Deck",
    description: "Day-party vibes with brunch service.",
    remainingTables: 4,
    totalTables: 18,
    ticketed: false,
    presaleDeposit: 50,
    playlistUrl: "https://example.com/brunch",
    coverImage: "https://example.com/image2.jpg",
  },
];

describe("EventsExplorer", () => {
  it("shows all events by default", () => {
    render(<EventsExplorer events={sampleEvents} />);
    expect(screen.getByText(/showing/i)).toHaveTextContent("2");
  });

  it("filters events when combining criteria", async () => {
    const user = userEvent.setup();
    render(<EventsExplorer events={sampleEvents} />);

    await user.click(screen.getByRole("button", { name: /nightlife/i }));
    await user.click(screen.getByRole("button", { name: /hosted nights/i }));

    expect(screen.getByText(/no events match/i)).toBeInTheDocument();
  });

  it("exposes accessible toggle states", async () => {
    const user = userEvent.setup();
    render(<EventsExplorer events={sampleEvents} />);

    const nightlifeToggle = screen.getByRole("button", { name: /nightlife/i });
    expect(nightlifeToggle).toHaveAttribute("aria-pressed", "false");

    await user.click(nightlifeToggle);
    expect(nightlifeToggle).toHaveAttribute("aria-pressed", "true");
  });
});
