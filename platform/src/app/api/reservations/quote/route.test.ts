import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/reservations/quote/route";

function createRequest(body: unknown) {
  return new NextRequest("http://localhost/api/reservations/quote", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

describe("reservation quote api", () => {
  it("rejects missing parameters", async () => {
    const request = createRequest({ eventId: "sonic-moon-0405" });
    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it("rejects unavailable packages", async () => {
    const request = createRequest({
      eventId: "sonic-moon-0405",
      tables: 2,
      packageId: "unknown",
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("returns a quote payload", async () => {
    const request = createRequest({
      eventId: "sonic-moon-0405",
      tables: 2,
      packageId: "vip-lounge",
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.quote).toMatchObject({
      eventId: "sonic-moon-0405",
      packageId: "vip-lounge",
      tablesApproved: 2,
    });
    expect(payload.quote.depositDue).toBeGreaterThan(0);
  });
});
