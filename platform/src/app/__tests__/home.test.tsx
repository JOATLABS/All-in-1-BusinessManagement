import React from "react";
import { render, screen } from "@testing-library/react";
import Home from "../page";

describe("Home page", () => {
  it("renders hero call to actions", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { name: /atlanta’s afrobeat sanctuary/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /reserve tonight/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view the gallery/i })).toBeInTheDocument();
  });

  it("provides quick navigation to experiences", () => {
    render(<Home />);
    expect(screen.getAllByRole("link", { name: /see all events/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("link", { name: /view full gallery/i })).toBeInTheDocument();
  });

  it("previews featured events", () => {
    render(<Home />);
    const eventCards = screen.getAllByRole("heading", { level: 3 });
    expect(eventCards.length).toBeGreaterThanOrEqual(2);
  });
});
