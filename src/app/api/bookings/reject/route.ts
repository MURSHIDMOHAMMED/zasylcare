import { NextResponse } from "next/server";
import { bookingActionSchema } from "@/lib/validations";
import { updateBookingStatus } from "@/services/booking.service";

export async function POST(request: Request) {
  const parsed = bookingActionSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid rejection payload" }, { status: 400 });

  const booking = await updateBookingStatus({
    bookingId: parsed.data.bookingId,
    companyId: parsed.data.companyId,
    status: "Rejected",
    reason: parsed.data.reason
  });

  return NextResponse.json({ booking });
}
