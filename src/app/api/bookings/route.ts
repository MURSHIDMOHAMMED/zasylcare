import { NextResponse } from "next/server";
import { listBookings } from "@/services/booking.service";

export async function GET() {
  const bookings = await listBookings();
  return NextResponse.json({ bookings });
}
