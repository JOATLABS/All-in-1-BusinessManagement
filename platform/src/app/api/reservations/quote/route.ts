import { NextRequest, NextResponse } from "next/server";
import { events } from "@/lib/data/events";
import { createReservationQuote } from "@/lib/services/reservations";

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const { eventId, tables } = payload as { eventId?: string; tables?: number };

  if (!eventId || typeof tables !== "number") {
    return NextResponse.json(
      { error: "eventId and tables are required" },
      { status: 400 }
    );
  }

  const event = events.find((item) => item.id === eventId);

  if (!event) {
    return NextResponse.json(
      { error: "Event not found" },
      { status: 404 }
    );
  }

  const quote = createReservationQuote({
    event,
    tablesRequested: tables,
  });

  return NextResponse.json({ quote });
}
