import { NextRequest, NextResponse } from "next/server";
import { events } from "@/lib/data/events";
import { createReservationQuote } from "@/lib/services/reservations";

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const { eventId, tables, packageId } = payload as {
    eventId?: string;
    tables?: number;
    packageId?: string;
  };

  if (!eventId || typeof tables !== "number" || !packageId) {
    return NextResponse.json(
      { error: "eventId, tables and packageId are required" },
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

  try {
    const quote = createReservationQuote({
      event,
      tablesRequested: tables,
      packageId,
    });

    return NextResponse.json({ quote });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
