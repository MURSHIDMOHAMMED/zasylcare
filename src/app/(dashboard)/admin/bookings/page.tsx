import { BookingTable } from "@/components/dashboard/BookingTable";
import { listBookings } from "@/services/booking.service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BookingsPage() {
  const bookings = await listBookings();
  return <BookingTable bookings={bookings} />;
}
