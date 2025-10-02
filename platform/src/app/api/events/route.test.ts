import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/events/route";

function createRequest(path: string) {
  return new NextRequest(`http://localhost${path}`);
}

describe("events api", () => {
  it("returns filtered events when query parameters provided", async () => {
    const request = createRequest("/api/events?category=night&ticket=host");
    const response = await GET(request);
    const payload = await response.json();

    expect(payload.events).toEqual([]);
    expect(payload.total).toBeGreaterThan(0);
  });
});
